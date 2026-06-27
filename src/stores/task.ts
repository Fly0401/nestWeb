import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskStatus, CreateTaskDto, UpdateTaskStatusDto } from '../api/types'
import * as api from '../api'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取任务列表
  async function fetchTasks(status?: TaskStatus) {
    loading.value = true
    error.value = null
    try {
      tasks.value = await api.getTasks(status)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '获取任务列表失败'
    } finally {
      loading.value = false
    }
  }

  // 创建任务（原地更新，不触发全局 loading 闪烁）
  async function addTask(dto: CreateTaskDto) {
    error.value = null
    try {
      const task = await api.createTask(dto)
      tasks.value.unshift(task)
      return task
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '创建任务失败'
      throw e
    }
  }

  // 更新任务状态（原地更新，不触发全局 loading 闪烁）
  async function changeStatus(id: number, dto: UpdateTaskStatusDto) {
    error.value = null
    try {
      const updated = await api.updateTaskStatus(id, dto)
      const idx = tasks.value.findIndex((t) => t.id === id)
      if (idx !== -1) {
        tasks.value[idx] = updated
      }
      return updated
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '更新状态失败'
      throw e
    }
  }

  // 删除任务（原地更新，不触发全局 loading 闪烁）
  async function removeTask(id: number) {
    error.value = null
    try {
      await api.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '删除任务失败'
      throw e
    }
  }

  // 根据ID查找任务
  function findTask(id: number) {
    return tasks.value.find((t) => t.id === id)
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    changeStatus,
    removeTask,
    findTask,
  }
})

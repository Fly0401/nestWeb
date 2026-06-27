import axios, { type AxiosResponse } from 'axios'
import type { Task, CreateTaskDto, UpdateTaskStatusDto, TaskStatus } from './types'

const BASE_URL = '/api'

const request = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 统一响应格式解包
function unwrap<T>(response: AxiosResponse): T {
  return (response.data as { code: number; message: string; data: T }).data
}

// ========== 任务相关接口 ==========

/**
 * 创建任务 - POST /tasks
 */
export async function createTask(dto: CreateTaskDto): Promise<Task> {
  return unwrap<Task>(await request.post('/tasks', dto))
}

/**
 * 获取任务列表 - GET /tasks?status?
 */
export async function getTasks(status?: TaskStatus): Promise<Task[]> {
  return unwrap<Task[]>(await request.get('/tasks', { params: status ? { status } : {} }))
}

/**
 * 获取单个任务 - GET /tasks/:id
 */
export async function getTask(id: number): Promise<Task> {
  return unwrap<Task>(await request.get(`/tasks/${id}`))
}

/**
 * 更新任务状态 - PATCH /tasks/:id/status
 */
export async function updateTaskStatus(id: number, dto: UpdateTaskStatusDto): Promise<Task> {
  return unwrap<Task>(await request.patch(`/tasks/${id}/status`, dto))
}

/**
 * 删除任务 - DELETE /tasks/:id
 */
export async function deleteTask(id: number): Promise<void> {
  return unwrap<void>(await request.delete(`/tasks/${id}`))
}

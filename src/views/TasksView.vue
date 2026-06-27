<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TaskStatus, Task } from '../api/types'
import { TASK_STATUS_LABELS } from '../api/types'
import { useTaskStore } from '../stores/task'
import TaskForm from '../components/TaskForm.vue'
import TaskDetail from '../components/TaskDetail.vue'

const route = useRoute()
const store = useTaskStore()

const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const selectedStatus = ref<TaskStatus | ''>('')
const highlightedId = ref<number | null>(null)

const statusCounts = computed(() => {
  const counts: Record<string, number> = { '': store.tasks.length }
  for (const status of ['TODO', 'IN_PROGRESS', 'DONE']) {
    counts[status] = store.tasks.filter((t) => t.status === status).length
  }
  return counts
})

onMounted(() => {
  const queryStatus = route.query.status as string | undefined
  if (queryStatus && ['TODO', 'IN_PROGRESS', 'DONE'].includes(queryStatus)) {
    selectedStatus.value = queryStatus as TaskStatus
  }
  loadTasks()
})

async function loadTasks() {
  const status = selectedStatus.value || undefined
  await store.fetchTasks(status)
}

function handleCreated() {
  showForm.value = false
}

function handleEdit(task: Task) {
  editingTask.value = task
}

function handleCloseDetail() {
  editingTask.value = null
}

function handleStatusChanged(updatedTask: Task) {
  editingTask.value = updatedTask
  highlightedId.value = updatedTask.id
  setTimeout(() => { highlightedId.value = null }, 700)
}
</script>

<template>
  <div class="tasks-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">任务列表</h1>
        <p class="page-subtitle">管理和追踪你的所有任务</p>
      </div>
      <button
        class="btn-create"
        :class="{ 'is-open': showForm }"
        @click="showForm = !showForm"
      >
        <span class="btn-icon">{{ showForm ? '−' : '+' }}</span>
        <span class="btn-label">{{ showForm ? '取消' : '新建任务' }}</span>
      </button>
    </header>

    <!-- Statistics -->
    <section v-if="!store.loading && !store.error" class="stats-section">
      <div class="stats-row">
        <div
          class="stat-card"
          :class="{ active: selectedStatus === '' }"
          @click="selectedStatus = '' as ''; loadTasks()"
        >
          <div class="stat-number">{{ statusCounts[''] }}</div>
          <div class="stat-label">全部</div>
        </div>
        <div
          v-for="status in ['TODO', 'IN_PROGRESS', 'DONE']"
          :key="status"
          class="stat-card"
          :class="[
            status.toLowerCase(),
            { active: selectedStatus === status }
          ]"
          @click="selectedStatus = status as TaskStatus; loadTasks()"
        >
          <div class="stat-number">{{ statusCounts[status] }}</div>
          <div class="stat-label">{{ TASK_STATUS_LABELS[status as TaskStatus] }}</div>
        </div>
      </div>
    </section>

    <!-- Task Form -->
    <Transition name="slide">
      <TaskForm v-if="showForm" @created="handleCreated" @cancel="showForm = false" />
    </Transition>

    <!-- Loading / Error -->
    <div v-if="store.loading" class="state-block loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else-if="store.error" class="state-block error">
      <span class="error-mark">!</span>
      <span>{{ store.error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.tasks.length === 0" class="empty-state">
      <div class="empty-icon">&#9998;</div>
      <p class="empty-text">暂无任务</p>
      <p class="empty-hint">点击上方「新建任务」开始记录</p>
    </div>

    <!-- Task List -->
    <TransitionGroup v-else name="list" tag="div" class="task-list">
      <div
        v-for="(task, index) in store.tasks"
        :key="task.id"
        class="task-card"
        :class="[task.status.toLowerCase(), { highlighted: highlightedId === task.id }]"
        :style="{ animationDelay: `${index * 0.04}s` }"
        @click="handleEdit(task)"
      >
        <div class="card-stripe"></div>
        <div class="card-body">
          <div class="card-header">
            <h3 class="card-title">{{ task.title }}</h3>
            <span
              class="status-chip"
              :class="task.status.toLowerCase()"
            >
              {{ TASK_STATUS_LABELS[task.status] }}
            </span>
          </div>
          <p v-if="task.description" class="card-desc">{{ task.description }}</p>
          <div class="card-footer">
            <time class="card-date">{{ task.createdAt }}</time>
            <button
              class="btn-delete"
              @click.stop="store.removeTask(task.id)"
              title="删除任务"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Detail Dialog -->
    <TaskDetail
      v-if="editingTask"
      :task="editingTask"
      @close="handleCloseDetail"
      @status-changed="handleStatusChanged"
    />
  </div>
</template>

<style scoped>
.tasks-page {
  max-width: 800px;
  margin: 0 auto;
}

/* ============ Header ============ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 16px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* ============ Create Button ============ */
.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--text-primary);
  color: var(--bg-card);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-top: 4px;
}

.btn-create:hover {
  background: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(184, 92, 56, 0.25);
}

.btn-create.is-open {
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  box-shadow: none;
}

.btn-create.is-open:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  box-shadow: none;
}

.btn-icon {
  font-size: 1.1rem;
  line-height: 1;
  font-weight: 300;
}

/* ============ Stats ============ */
.stats-section {
  margin-bottom: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-soft);
  border-color: #D4C9BC;
}

.stat-card.active {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(184, 92, 56, 0.1);
}

.stat-card.todo.active {
  border-color: #9CA3AF;
  box-shadow: 0 2px 8px rgba(156, 163, 175, 0.1);
}

.stat-card.in_progress.active {
  border-color: #4A7C8C;
  box-shadow: 0 2px 8px rgba(74, 124, 140, 0.1);
}

.stat-card.done.active {
  border-color: #5B8C5A;
  box-shadow: 0 2px 8px rgba(91, 140, 90, 0.1);
}

.stat-number {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 6px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ============ Slide Transition ============ */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.98);
}

/* ============ States ============ */
.state-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  font-size: 0.92rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #C0392B;
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

/* ============ Empty State ============ */
.empty-state {
  text-align: center;
  padding: 56px 20px;
}

.empty-icon {
  font-size: 2.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ============ Task List ============ */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  display: flex;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  opacity: 0;
  animation: cardIn 0.4s ease forwards;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card:hover {
  box-shadow: 0 8px 24px var(--shadow-medium);
  transform: translateY(-2px);
  border-color: #D4C9BC;
}

.card-stripe {
  width: 4px;
  flex-shrink: 0;
  transition: width 0.2s;
}

.task-card:hover .card-stripe {
  width: 6px;
}

.task-card.todo .card-stripe {
  background: #9CA3AF;
}

.task-card.in_progress .card-stripe {
  background: #4A7C8C;
}

.task-card.done .card-stripe {
  background: #5B8C5A;
}

.card-body {
  flex: 1;
  padding: 14px 18px;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.card-title {
  font-family: var(--font-body);
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-line-orient: vertical;
}

.status-chip {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

.status-chip.todo {
  background: var(--status-todo-bg);
  color: var(--status-todo-text);
}

.status-chip.in_progress {
  background: var(--status-progress-bg);
  color: var(--status-progress-text);
}

.status-chip.done {
  background: var(--status-done-bg);
  color: var(--status-done-text);
}

.card-desc {
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-line-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  padding: 0;
}

.task-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #FDF2F2;
  color: #C0392B;
}

/* Highlight flash when status changes */
.task-card.highlighted {
  animation: cardHighlight 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardHighlight {
  0% { box-shadow: 0 0 0 0 rgba(184, 92, 56, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(184, 92, 56, 0.05); }
  100% { box-shadow: 0 0 0 0 rgba(184, 92, 56, 0); }
}

/* ============ List Transition ============ */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>

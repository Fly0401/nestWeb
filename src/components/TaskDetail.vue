<script setup lang="ts">
import { ref } from 'vue'
import type { TaskStatus, Task } from '../api/types'
import { TASK_STATUS_LABELS } from '../api/types'
import { useTaskStore } from '../stores/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  close: []
  statusChanged: [task: Task]
}>()

const store = useTaskStore()
const changing = ref(false)
const justChanged = ref<TaskStatus | null>(null)

const statuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const

async function changeStatus(status: TaskStatus) {
  if (status === props.task.status || changing.value) return

  changing.value = true
  try {
    const updated = await store.changeStatus(props.task.id, { status })
    justChanged.value = status
    emit('statusChanged', updated)
    setTimeout(() => { justChanged.value = null }, 800)
  } catch {
    // handled in store
  } finally {
    changing.value = false
  }
}

function close() {
  emit('close')
}

function handleOverlayClick() {
  close()
}

function handleDialogClick(e: MouseEvent) {
  e.stopPropagation()
}
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click="handleOverlayClick">
      <div class="dialog" @click="handleDialogClick">
        <!-- Header with dynamic status chip -->
        <div class="dialog-header">
          <div class="header-left">
            <h2 class="dialog-title">{{ task.title }}</h2>
            <span
              class="status-chip"
              :class="[task.status.toLowerCase(), { 'just-changed': justChanged === task.status }]"
            >
              {{ TASK_STATUS_LABELS[task.status] }}
            </span>
          </div>
          <button class="close-btn" @click="close" aria-label="关闭">&#215;</button>
        </div>

        <div class="dialog-body">
          <!-- Status Selector - the primary interaction -->
          <div class="status-section">
            <span class="status-section-label">更改状态</span>
            <div class="status-segments">
              <button
                v-for="status in statuses"
                :key="status"
                class="segment"
                :class="[
                  status.toLowerCase(),
                  {
                    active: task.status === status,
                    changing: changing,
                    'just-changed': justChanged === status,
                  }
                ]"
                :disabled="changing"
                @click="changeStatus(status as TaskStatus)"
              >
                <span class="segment-dot"></span>
                <span class="segment-label">{{ TASK_STATUS_LABELS[status] }}</span>
                <span v-if="task.status === status" class="segment-check">&#10003;</span>
                <span v-if="changing && justChanged === status" class="segment-spinner"></span>
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Task Details -->
          <div class="detail-row" v-if="task.description">
            <span class="detail-label">描述</span>
            <p class="detail-value">{{ task.description }}</p>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <time class="detail-value">{{ task.createdAt }}</time>
            </div>
            <div class="detail-item">
              <span class="detail-label">更新时间</span>
              <time class="detail-value">{{ task.updatedAt }}</time>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务编号</span>
              <span class="detail-value mono">#{{ task.id }}</span>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-close" @click="close">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 41, 38, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(45, 41, 38, 0.2);
  animation: dialogIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
}

.header-left {
  flex: 1;
  padding-right: 12px;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
  margin: 0 0 10px 0;
}

.status-chip {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
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

.status-chip.just-changed {
  animation: chipPop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chipPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dialog-body {
  padding: 24px 24px 8px;
}

/* ============ Status Section ============ */
.status-section {
  margin-bottom: 20px;
}

.status-section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.status-segments {
  display: flex;
  gap: 8px;
}

.segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 12px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.segment:hover:not(:disabled) {
  border-color: #C8BFB3;
  background: var(--bg-primary);
}

.segment:disabled {
  cursor: default;
}

.segment-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.25s;
}

.segment.todo .segment-dot { background: #9CA3AF; }
.segment.in_progress .segment-dot { background: #4A7C8C; }
.segment.done .segment-dot { background: #5B8C5A; }

.segment-label {
  letter-spacing: 0.02em;
}

/* Active state */
.segment.active.todo {
  background: var(--status-todo-bg);
  border-color: #9CA3AF;
  color: var(--status-todo-text);
}

.segment.active.in_progress {
  background: var(--status-progress-bg);
  border-color: #4A7C8C;
  color: var(--status-progress-text);
}

.segment.active.done {
  background: var(--status-done-bg);
  border-color: #5B8C5A;
  color: var(--status-done-text);
}

.segment.active .segment-dot {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

/* Just changed - brief pulse */
.segment.just-changed {
  animation: segmentPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes segmentPulse {
  0% { transform: scale(1); }
  30% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.segment-check {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
}

.segment-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0 18px;
}

/* ============ Details ============ */
.detail-row {
  margin-bottom: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.detail-value {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
  word-break: break-word;
}

.detail-value.mono {
  font-variant-numeric: tabular-nums;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.details-grid .detail-item:last-child {
  grid-column: 1 / -1;
}

/* ============ Footer ============ */
.dialog-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 9px 24px;
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: #C8BFB3;
}
</style>

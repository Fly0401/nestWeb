<script setup lang="ts">
import { ref } from 'vue'
import type { TaskStatus } from '../api/types'
import { useTaskStore } from '../stores/task'

const props = withDefaults(defineProps<{
  editTask?: {
    id: number
    title: string
    description?: string
    status: TaskStatus
  }
}>(), {})

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const store = useTaskStore()
const isEdit = !!props.editTask

const title = ref(props.editTask?.title || '')
const description = ref(props.editTask?.description || '')
const submitting = ref(false)
const titleError = ref('')

function validate() {
  titleError.value = ''
  if (!title.value.trim()) {
    titleError.value = '标题不能为空'
    return false
  }
  if (title.value.length > 100) {
    titleError.value = '标题最多100个字符'
    return false
  }
  return true
}

async function submit() {
  if (!validate()) return

  submitting.value = true
  try {
    if (isEdit) {
      emit('cancel')
      return
    }
    await store.addTask({
      title: title.value.trim(),
      description: description.value.trim() || undefined,
    })
    title.value = ''
    description.value = ''
    emit('created')
  } catch {
    // error handled in store
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="task-form">
    <h3 class="form-heading">{{ isEdit ? '编辑任务' : '新建任务' }}</h3>
    <div class="form-body">
      <div class="form-group">
        <label for="title" class="form-label">标题 <span class="required">*</span></label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="输入任务标题..."
          maxlength="100"
          :class="{ 'input-error': titleError }"
          @keyup.enter="submit"
        />
        <span v-if="titleError" class="field-error">{{ titleError }}</span>
      </div>
      <div class="form-group">
        <label for="description" class="form-label">描述</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="任务详细描述（可选）"
          rows="3"
        ></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-submit" @click="submit" :disabled="submitting">
          {{ submitting ? '提交中...' : isEdit ? '保存' : '创建任务' }}
        </button>
        <button class="btn-cancel" @click="emit('cancel')">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-form {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 20px 22px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px var(--shadow-soft);
}

.form-heading {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.required {
  color: var(--accent);
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
  outline: none;
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px rgba(184, 92, 56, 0.08);
}

.input-error {
  border-color: #C0392B !important;
  background: #FDF2F2 !important;
}

.field-error {
  display: block;
  font-size: 0.78rem;
  color: #C0392B;
  margin-top: 4px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.btn-submit {
  padding: 10px 22px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 92, 56, 0.2);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  padding: 10px 22px;
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

.btn-cancel:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: #C8BFB3;
}
</style>

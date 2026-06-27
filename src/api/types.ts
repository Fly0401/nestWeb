/**
 * 对应 NestJS Task 实体和统一响应格式
 */

// 任务状态枚举，与后端 TaskStatus 一致
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// 任务状态显示映射
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '待办',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.DONE]: '已完成',
}

// 任务状态样式映射
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '#e0e0e0',
  [TaskStatus.IN_PROGRESS]: '#4a90d9',
  [TaskStatus.DONE]: '#52c41a',
}

// 创建任务的 DTO
export interface CreateTaskDto {
  title: string
  description?: string
}

// 更新任务状态的 DTO
export interface UpdateTaskStatusDto {
  status: TaskStatus
}

// Task 实体（与后端 entity 一致）
export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

// 统一响应格式（后端 ResponseInterceptor 包装）
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

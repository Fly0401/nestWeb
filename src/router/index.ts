import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TasksView from '../views/TasksView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'tasks',
    component: TasksView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

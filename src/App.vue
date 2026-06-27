<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <nav class="navbar">
      <div class="nav-inner">
        <RouterLink to="/" class="nav-brand">
          <span class="brand-icon">&#9670;</span>
          <span class="brand-text">Task Desk</span>
        </RouterLink>
        <div class="nav-divider"></div>
        <RouterLink to="/" class="nav-link active">任务列表</RouterLink>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 1.1rem;
  color: var(--accent);
  line-height: 1;
}

.brand-text {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.nav-brand:hover .brand-text {
  text-decoration: none;
  color: var(--accent);
  transition: color 0.2s;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}

.nav-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 6px 2px;
  position: relative;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  text-decoration: none;
}

.nav-link.active {
  color: var(--accent);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

.main-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 60px;
}
</style>

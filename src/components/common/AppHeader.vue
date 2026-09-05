<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="app-header">
    <button class="hamburger" type="button" aria-label="Toggle menu" @click="$emit('toggle-sidebar')">
      <span />
      <span />
      <span />
    </button>

    <div class="search-box">
      <input type="text" placeholder="Search shops, tenants..." />
    </div>

    <div class="header-right">
      <div class="user-badge">
        <span class="user-avatar">{{ user?.name?.charAt(0) }}</span>
        <span class="user-name">{{ user?.name }}</span>
      </div>
      <button class="btn btn-text" type="button" @click="handleLogout">Logout</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-5);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  height: 2px;
  background: var(--color-text);
  border-radius: 1px;
}

.search-box {
  flex: 1;
  max-width: 360px;
}

.search-box input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-muted);
  font-size: var(--font-size-sm);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-muted);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

@media (max-width: 900px) {
  .hamburger {
    display: flex;
  }

  .search-box {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>

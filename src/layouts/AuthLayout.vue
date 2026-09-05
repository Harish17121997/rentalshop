<script setup>
</script>

<template>
  <div class="auth-layout">
    <div class="auth-panel">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-4);
}

.auth-panel {
  width: 100%;
  max-width: 400px;
}
</style>

<script setup>
defineProps({
  label: { type: String, default: 'Loading...' },
})
</script>

<template>
  <div class="loading-state">
    <span class="spinner" />
    <span class="loading-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading-label {
  font-size: var(--font-size-sm);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

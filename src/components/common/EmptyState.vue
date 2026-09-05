<script setup>
defineProps({
  title: { type: String, default: 'Nothing here yet' },
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="empty-state">
    <p class="empty-title">{{ title }}</p>
    <p v-if="message" class="empty-message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--space-7) var(--space-4);
  color: var(--color-text-muted);
}

.empty-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.empty-message {
  font-size: var(--font-size-sm);
}
</style>

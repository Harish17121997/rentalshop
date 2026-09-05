<script setup>
defineProps({
  title: { type: String, default: '' },
})
defineEmits(['close'])
</script>

<template>
  <Transition name="drawer-fade">
    <div class="drawer-overlay" @click.self="$emit('close')">
      <Transition name="drawer-slide" appear>
        <aside class="drawer-panel card">
          <div class="drawer-header">
            <h2>{{ title }}</h2>
            <button class="drawer-close" type="button" aria-label="Close" @click="$emit('close')">×</button>
          </div>
          <div class="drawer-body">
            <slot />
          </div>
        </aside>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 18, 22, 0.45);
  display: flex;
  justify-content: flex-end;
  z-index: 50;
}

.drawer-panel {
  width: 100%;
  max-width: 420px;
  height: 100%;
  overflow-y: auto;
  padding: var(--space-5);
  border-radius: 0;
  border-right: none;
  border-top: none;
  border-bottom: none;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.drawer-header h2 {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.drawer-close {
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
}

.drawer-close:hover {
  color: var(--color-text);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .drawer-panel {
    max-width: 100%;
  }
}
</style>

<script setup>
import { getMonthOptions, getYearOptions, currentYear } from '@/utils/dates'

const props = defineProps({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
})
const emit = defineEmits(['update:month', 'update:year'])

const monthOptions = getMonthOptions()
const yearOptions = getYearOptions(currentYear())
</script>

<template>
  <div class="month-year-selector">
    <select :value="month" @change="emit('update:month', Number($event.target.value))">
      <option v-for="opt in monthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <select :value="year" @change="emit('update:year', Number($event.target.value))">
      <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>

<style scoped>
.month-year-selector {
  display: flex;
  gap: var(--space-2);
}

.month-year-selector select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}
</style>

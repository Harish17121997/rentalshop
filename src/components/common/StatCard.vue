<script setup>
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  tone: { type: String, default: 'neutral' }, // neutral | success | danger | warning | info
  isCurrency: { type: Boolean, default: true },
  hint: { type: String, default: '' },
})

const displayValue = props.isCurrency && typeof props.value === 'number'
  ? formatCurrency(props.value)
  : props.value
</script>

<template>
  <div class="stat-card card" :class="`tone-${tone}`">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value">{{ displayValue }}</p>
    <p v-if="hint" class="stat-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat-card {
  padding: var(--space-4) var(--space-5);
  border-left: 3px solid var(--color-border);
}

.tone-success { border-left-color: var(--color-success); }
.tone-danger { border-left-color: var(--color-danger); }
.tone-warning { border-left-color: var(--color-warning); }
.tone-info { border-left-color: var(--color-info); }

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.tone-success .stat-value { color: var(--color-success); }
.tone-danger .stat-value { color: var(--color-danger); }
.tone-warning .stat-value { color: var(--color-warning); }

.stat-hint {
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
}
</style>

<script setup>
const props = defineProps({
  status: { type: String, required: true },
})

const TONE_MAP = {
  Paid: 'success',
  Rented: 'success',
  'Fully Refunded': 'success',
  Sold: 'success',
  Profit: 'success',

  Pending: 'warning',
  'Partially Paid': 'warning',
  Held: 'warning',
  'Partially Refunded': 'warning',
  'Partially Sold': 'warning',

  Vacant: 'danger',
  Inactive: 'danger',
  Cancelled: 'danger',
  Loss: 'danger',

  Active: 'info',
  'Under Maintenance': 'info',
}

const tone = TONE_MAP[props.status] || 'neutral'
</script>

<template>
  <span class="status-badge" :class="`tone-${tone}`">{{ status }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  white-space: nowrap;
}

.tone-success { background: var(--color-success-bg); color: var(--color-success); }
.tone-danger { background: var(--color-danger-bg); color: var(--color-danger); }
.tone-warning { background: var(--color-warning-bg); color: var(--color-warning); }
.tone-info { background: var(--color-info-bg); color: var(--color-info); }
.tone-neutral { background: var(--color-surface-muted); color: var(--color-text-muted); }
</style>

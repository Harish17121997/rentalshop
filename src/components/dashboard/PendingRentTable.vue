<script setup>
import { formatCurrency } from '@/utils/currency'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'

defineProps({
  rows: { type: Array, required: true },
})
const emit = defineEmits(['select'])
</script>

<template>
  <EmptyState v-if="!rows.length" title="No pending rent" message="Everything is collected for this period." />

  <div v-else class="table-scroll">
    <table class="data-table">
      <thead>
        <tr>
          <th>Unit</th>
          <th>Tenant</th>
          <th>Pending</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.unitId" class="clickable-row" @click="emit('select', row)">
          <td>{{ row.unitName }}</td>
          <td>{{ row.tenantName }}</td>
          <td>{{ formatCurrency(row.pending) }}</td>
          <td><StatusBadge :status="row.status" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background: var(--color-surface-muted);
}
</style>

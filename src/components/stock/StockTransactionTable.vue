<script setup>
import { formatCurrency } from '@/utils/currency'
import { formatDisplayDate } from '@/utils/dates'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'

defineProps({
  activeRows: { type: Array, required: true },
  doneRows: { type: Array, required: true },
})
const emit = defineEmits(['sell', 'edit'])
</script>

<template>
  <section class="stock-section">
    <h3 class="stock-section-title">Active <span class="count-badge">{{ activeRows.length }}</span></h3>

    <EmptyState v-if="!activeRows.length" title="No active positions" message="Everything you've bought has been sold." />

    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Buy Price</th>
            <th>Buy Date</th>
            <th>Buy Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in activeRows" :key="row.transactionId">
            <td class="cell-strong">{{ row.companyName }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.quantity }}</td>
            <td>{{ formatCurrency(row.buyPrice, { decimals: true }) }}</td>
            <td>{{ formatDisplayDate(row.buyDate) }}</td>
            <td>{{ formatCurrency(row.buyAmount) }}</td>
            <td class="cell-actions">
              <button class="btn btn-text" type="button" @click="emit('edit', row)">Edit</button>
              <button class="btn btn-text" type="button" @click="emit('sell', row)">Record Sale</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="stock-section">
    <h3 class="stock-section-title">Done <span class="count-badge">{{ doneRows.length }}</span></h3>

    <EmptyState v-if="!doneRows.length" title="No completed trades yet" message="Sold positions will appear here with their profit or loss." />

    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Buy Date</th>
            <th>Sell Date</th>
            <th>Buy Amount</th>
            <th>Sell Amount</th>
            <th>Margin</th>
            <th>Profit / Loss</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in doneRows" :key="row.transactionId">
            <td class="cell-strong">{{ row.companyName }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.quantity }}</td>
            <td>{{ formatDisplayDate(row.buyDate) }}</td>
            <td>{{ formatDisplayDate(row.sellDate) }}</td>
            <td>{{ formatCurrency(row.buyAmount) }}</td>
            <td>{{ formatCurrency(row.sellAmount) }}</td>
            <td :class="row.netProfit >= 0 ? 'text-success' : 'text-danger'">{{ row.profitPercent.toFixed(2) }}%</td>
            <td :class="row.netProfit >= 0 ? 'text-success' : 'text-danger'">{{ formatCurrency(row.netProfit) }}</td>
            <td><StatusBadge :status="row.status" /></td>
            <td class="cell-actions"><button class="btn btn-text" type="button" @click="emit('edit', row)">Edit</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.stock-section {
  margin-bottom: var(--space-6);
}

.stock-section:last-child {
  margin-bottom: 0;
}

.stock-section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 var(--space-2);
  border-radius: 999px;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

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

.data-table tbody tr:hover {
  background: var(--color-surface-muted);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.cell-strong {
  font-weight: 600;
  color: var(--color-text);
}

.cell-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
</style>

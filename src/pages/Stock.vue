<script setup>
import { ref, onMounted } from 'vue'
import { useStock } from '@/composables/useStock'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatCard from '@/components/common/StatCard.vue'
import StockTransactionForm from '@/components/stock/StockTransactionForm.vue'
import StockTransactionTable from '@/components/stock/StockTransactionTable.vue'
import RecordSaleModal from '@/components/stock/RecordSaleModal.vue'

const { loading, errorMessage, activeRows, doneRows, summary, load, addTransaction, editTransaction, recordSale } = useStock()

const showAddForm = ref(false)
const editingTransaction = ref(null)
const saleModalTransaction = ref(null)

async function handleAddTransaction(payload) {
  await addTransaction(payload)
  showAddForm.value = false
}

async function handleSaveEditedTransaction(payload) {
  await editTransaction(editingTransaction.value.transactionId, payload)
  editingTransaction.value = null
}

async function handleRecordSale(payload) {
  await recordSale(saleModalTransaction.value.transactionId, payload)
  saleModalTransaction.value = null
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Stock / IPO</h1>
      <button class="btn btn-primary" type="button" @click="showAddForm = true">+ Add Transaction</button>
    </div>

    <LoadingSpinner v-if="loading" label="Loading transactions..." />

    <template v-else>
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <div class="stat-grid">
        <StatCard label="Total Invested" :value="summary.totalInvested" tone="info" />
        <StatCard label="Total Sold" :value="summary.totalSold" tone="info" />
        <StatCard
          label="Realized Profit / Loss"
          :value="summary.realizedProfit"
          :tone="summary.realizedProfit >= 0 ? 'success' : 'danger'"
        />
        <StatCard label="Active" :value="summary.activeCount" :is-currency="false" tone="info" />
        <StatCard label="Profit Trades" :value="summary.winners" :is-currency="false" tone="success" />
        <StatCard label="Loss Trades" :value="summary.losers" :is-currency="false" tone="danger" />
      </div>

      <div class="card transactions-section">
        <StockTransactionTable
          :active-rows="activeRows"
          :done-rows="doneRows"
          @sell="saleModalTransaction = $event"
          @edit="editingTransaction = $event"
        />
      </div>
    </template>

    <StockTransactionForm v-if="showAddForm" @close="showAddForm = false" @save="handleAddTransaction" />

    <StockTransactionForm
      v-if="editingTransaction"
      :transaction="editingTransaction"
      @close="editingTransaction = null"
      @save="handleSaveEditedTransaction"
    />

    <RecordSaleModal
      v-if="saleModalTransaction"
      :transaction="saleModalTransaction"
      @close="saleModalTransaction = null"
      @save="handleRecordSale"
    />
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.transactions-section {
  padding: var(--space-5);
}
</style>

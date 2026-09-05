<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboard } from '@/composables/useDashboard'
import { currentMonth, currentYear } from '@/utils/dates'
import { formatCurrency } from '@/utils/currency'
import StatCard from '@/components/common/StatCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import MonthYearSelector from '@/components/dashboard/MonthYearSelector.vue'
import RentCollectionChart from '@/components/dashboard/RentCollectionChart.vue'
import PendingRentTable from '@/components/dashboard/PendingRentTable.vue'

const router = useRouter()
const month = ref(currentMonth())
const year = ref(currentYear())

const {
  loading,
  errorMessage,
  rentSummary,
  incomeByCategory,
  stockSummary,
  pendingRentRows,
  load,
} = useDashboard()

const pendingCount = computed(() => pendingRentRows.value.length)
const totalIncome = computed(() => rentSummary.value.received + stockSummary.value.realizedProfit)

function refresh() {
  load({ month: month.value, year: year.value })
}

function goToRental() {
  router.push({ name: 'rent' })
}

function goToStock() {
  router.push({ name: 'stock' })
}

onMounted(refresh)
watch([month, year], refresh)
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p class="building-name">Kadam Complex Kinwat</p>
      </div>
      <MonthYearSelector v-model:month="month" v-model:year="year" />
    </div>

    <LoadingSpinner v-if="loading" label="Loading dashboard..." />

    <template v-else>
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <div class="alert-row" v-if="pendingCount > 0 || stockSummary.realizedProfit !== 0">
        <span v-if="pendingCount > 0" class="alert alert-warning">⚠ {{ pendingCount }} unit(s) with rent pending</span>
        <span v-if="stockSummary.realizedProfit > 0" class="alert alert-success">📈 {{ formatCurrency(stockSummary.realizedProfit) }} stock profit</span>
        <span v-else-if="stockSummary.realizedProfit < 0" class="alert alert-danger">📉 {{ formatCurrency(Math.abs(stockSummary.realizedProfit)) }} stock loss</span>
      </div>

      <div class="stat-grid">
        <StatCard label="Expected Rent" :value="rentSummary.expected" tone="info" />
        <StatCard label="Rent Received" :value="rentSummary.received" tone="success" />
        <StatCard label="Rent Pending" :value="rentSummary.pending" tone="warning" />
        <StatCard label="Stock/IPO Profit" :value="stockSummary.realizedProfit" :tone="stockSummary.realizedProfit >= 0 ? 'success' : 'danger'" />
        <StatCard label="Total Income" :value="totalIncome" tone="info" hint="Rent received + realized stock profit" />
      </div>

      <div class="section-grid">
        <div class="card chart-card">
          <h2>Rent Collection</h2>
          <RentCollectionChart :received="rentSummary.received" :pending="rentSummary.pending" />
        </div>

        <div class="card income-by-category">
          <h2>Income by Category</h2>
          <ul class="type-list">
            <li v-for="(amount, category) in incomeByCategory" :key="category">
              <span>{{ category }}</span>
              <strong>{{ formatCurrency(amount) }}</strong>
            </li>
          </ul>
        </div>

        <div class="card stock-snapshot">
          <div class="section-header">
            <h2>Stock / IPO</h2>
            <button class="btn btn-text" type="button" @click="goToStock">View all</button>
          </div>
          <div class="stock-metric-list">
            <div class="stock-metric">
              <span class="text-muted">Active</span>
              <strong>{{ stockSummary.activeCount }}</strong>
            </div>
            <div class="stock-metric">
              <span class="text-muted">Profit Trades</span>
              <strong class="text-success">{{ stockSummary.winners }}</strong>
            </div>
            <div class="stock-metric">
              <span class="text-muted">Loss Trades</span>
              <strong class="text-danger">{{ stockSummary.losers }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="card pending-rent-section">
        <div class="section-header">
          <h2>Pending Rent</h2>
          <button class="btn btn-secondary" type="button" @click="goToRental">Go to Rental</button>
        </div>
        <PendingRentTable :rows="pendingRentRows" @select="goToRental" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard h2 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.building-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.alert-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.alert {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.alert-danger { background: var(--color-danger-bg); color: var(--color-danger); }
.alert-warning { background: var(--color-warning-bg); color: var(--color-warning); }
.alert-success { background: var(--color-success-bg); color: var(--color-success); }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.section-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.chart-card,
.income-by-category,
.stock-snapshot {
  padding: var(--space-5);
}

.type-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.type-list li {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-base);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.type-list li:last-child {
  border-bottom: none;
}

.stock-metric-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stock-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-base);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.stock-metric:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stock-metric strong {
  font-size: var(--font-size-md);
}

.pending-rent-section {
  padding: var(--space-5);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-header h2 {
  margin-bottom: 0;
}

@media (max-width: 1100px) {
  .section-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
}
</style>

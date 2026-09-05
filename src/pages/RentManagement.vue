<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRent } from '@/composables/useRent'
import { currentMonth, currentYear } from '@/utils/dates'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatCard from '@/components/common/StatCard.vue'
import RentalUnitRow from '@/components/rent/RentalUnitRow.vue'
import RentalUnitForm from '@/components/rent/RentalUnitForm.vue'
import AddRentEntryModal from '@/components/rent/AddRentEntryModal.vue'

const TABS = ['Shops', 'House']
const CATEGORY_BY_TAB = { Shops: 'Shop', House: 'House' }

const activeTab = ref('Shops')
const expandedUnitId = ref(null)
const showAddHouseForm = ref(false)
const showAddEntry = ref(false)
const editingUnit = ref(null)

const period = { month: currentMonth(), year: currentYear() }

const { loading, errorMessage, units, historyByUnit, loadUnits, loadHistory, addUnit, editUnit, addEntry } = useRent()

const filteredUnits = computed(() => units.value.filter((u) => u.category === CATEGORY_BY_TAB[activeTab.value]))

const totals = computed(() => {
  const list = filteredUnits.value
  return {
    expected: list.reduce((sum, u) => sum + u.expectedThisMonth, 0),
    paid: list.reduce((sum, u) => sum + u.paidThisMonth, 0),
    pending: list.reduce((sum, u) => sum + u.pendingThisMonth, 0),
  }
})

function refresh() {
  loadUnits(period)
}

async function toggleRow(unit) {
  if (expandedUnitId.value === unit.unitId) {
    expandedUnitId.value = null
    return
  }
  expandedUnitId.value = unit.unitId
  await loadHistory(unit.unitId)
}

async function handleAddHouse(payload) {
  await addUnit(payload)
  showAddHouseForm.value = false
}

async function handleSaveEdit(payload) {
  await editUnit(editingUnit.value.unitId, payload)
  editingUnit.value = null
}

async function handleSaveEntry(payload) {
  await addEntry(payload, period)
  showAddEntry.value = false
}

onMounted(refresh)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Rental</h1>
      <div class="header-actions">
        <button v-if="activeTab === 'House'" class="btn btn-secondary" type="button" @click="showAddHouseForm = true">
          + Add House
        </button>
        <button class="btn btn-primary" type="button" @click="showAddEntry = true">+ Add Entry</button>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in TABS"
        :key="tab"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" label="Loading rental units..." />

    <template v-else>
      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <h2 v-if="activeTab === 'Shops'" class="building-name">Kadam Complex Kinwat</h2>

      <div class="summary-row">
        <StatCard label="Expected" :value="totals.expected" tone="info" />
        <StatCard label="Received" :value="totals.paid" tone="success" />
        <StatCard label="Pending" :value="totals.pending" tone="warning" />
      </div>

      <EmptyState
        v-if="!filteredUnits.length"
        title="No units yet"
        :message="activeTab === 'House' ? 'Add a house to get started.' : 'No shops configured yet.'"
      />

      <div v-else class="unit-list">
        <RentalUnitRow
          v-for="unit in filteredUnits"
          :key="unit.unitId"
          :unit="unit"
          :expanded="expandedUnitId === unit.unitId"
          :history="historyByUnit[unit.unitId] || []"
          @toggle="toggleRow(unit)"
          @edit="editingUnit = unit"
        />
      </div>
    </template>

    <RentalUnitForm v-if="showAddHouseForm" category="House" @close="showAddHouseForm = false" @save="handleAddHouse" />

    <RentalUnitForm v-if="editingUnit" :unit="editingUnit" @close="editingUnit = null" @save="handleSaveEdit" />

    <AddRentEntryModal
      v-if="showAddEntry"
      :units="units"
      :initial-unit-id="filteredUnits[0]?.unitId"
      @close="showAddEntry = false"
      @save="handleSaveEntry"
    />
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  padding: var(--space-3) var(--space-4);
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.building-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>

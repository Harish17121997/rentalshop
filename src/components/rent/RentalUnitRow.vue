<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import { formatDisplayDate, getMonthName } from '@/utils/dates'
import { derivePaymentStatus } from '@/utils/calculations'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  unit: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
  history: { type: Array, default: () => [] },
})
const emit = defineEmits(['toggle', 'edit', 'edit-payment'])

const historyRows = computed(() =>
  props.history
    .map((h) => ({
      ...h,
      status: derivePaymentStatus(h),
      pending: Math.max(0, (Number(h.expectedAmount) || 0) - (Number(h.paidAmount) || 0)),
    }))
    .sort((a, b) => (b.year - a.year) || (b.month - a.month)),
)
</script>

<template>
  <div class="unit-row card">
    <button class="unit-row-main" type="button" @click="emit('toggle')">
      <div class="unit-info">
        <span class="unit-name">{{ unit.unitName }}</span>
        <span class="tenant-chip">
          {{ unit.tenantName || 'No tenant' }}<template v-if="unit.tenantPhone"> · {{ unit.tenantPhone }}</template>
        </span>
      </div>

      <div class="unit-status">
        <span class="unit-rent text-muted">{{ formatCurrency(unit.monthlyRent) }}/mo</span>
        <StatusBadge :status="unit.status" />
      </div>

      <span class="expand-arrow" :class="{ open: expanded }">›</span>
    </button>

    <div v-if="expanded" class="unit-history">
      <section class="detail-section tenant-section">
        <div class="detail-section-header">
          <h4>Tenant Details</h4>
          <button class="btn btn-text btn-edit" type="button" @click.stop="emit('edit')">Edit</button>
        </div>
        <dl class="tenant-detail-grid">
          <div>
            <dt>Tenant Name</dt>
            <dd>{{ unit.tenantName || '—' }}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{{ unit.tenantPhone || '—' }}</dd>
          </div>
          <div>
            <dt>Aadhar Card</dt>
            <dd>{{ unit.tenantAadhar || '—' }}</dd>
          </div>
          <div>
            <dt>Agreement / Given Date</dt>
            <dd>{{ unit.agreementDate ? formatDisplayDate(unit.agreementDate) : '—' }}</dd>
          </div>
          <div>
            <dt>Monthly Rent</dt>
            <dd>{{ formatCurrency(unit.monthlyRent) }}</dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>{{ formatCurrency(unit.deposit) }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><StatusBadge :status="unit.status" /></dd>
          </div>
        </dl>
      </section>

      <section class="detail-section">
        <h4 class="detail-section-title">Paid Listing</h4>

        <EmptyState v-if="!historyRows.length" title="No payments logged yet" message="Entries will appear here once rent is recorded for this unit." />

        <div v-else class="payment-list">
          <div v-for="row in historyRows" :key="row.paymentId" class="payment-row">
            <div class="payment-row-top">
              <span class="payment-month">{{ getMonthName(row.month, { short: true }) }} {{ row.year }}</span>
              <div class="payment-row-top-actions">
                <StatusBadge :status="row.status" />
                <button
                  v-if="row.paidDate"
                  class="btn btn-text btn-edit"
                  type="button"
                  @click="emit('edit-payment', row)"
                >
                  Edit
                </button>
              </div>
            </div>

            <div class="payment-row-grid">
              <div class="payment-field">
                <span class="payment-field-label">Amount Paid</span>
                <span class="payment-field-value">{{ formatCurrency(row.paidAmount) }}</span>
                <span v-if="row.pending > 0" class="text-warning payment-field-note">{{ formatCurrency(row.pending) }} pending</span>
              </div>
              <div class="payment-field">
                <span class="payment-field-label">Date</span>
                <span class="payment-field-value">{{ row.paidDate ? formatDisplayDate(row.paidDate) : '—' }}</span>
              </div>
              <div class="payment-field">
                <span class="payment-field-label">Method</span>
                <span class="payment-field-value">{{ row.paymentMethod || '—' }}</span>
              </div>
            </div>

            <p v-if="row.description" class="payment-description">{{ row.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.unit-row {
  padding: 0;
  overflow: hidden;
}

.unit-row-main {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.unit-row-main:hover {
  background: var(--color-surface-muted);
}

.unit-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.unit-name {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.tenant-chip {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--color-tenant-bg);
  color: var(--color-tenant);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.unit-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.unit-rent {
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.expand-arrow {
  font-size: 20px;
  color: var(--color-text-subtle);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.expand-arrow.open {
  transform: rotate(90deg);
}

.unit-history {
  padding: var(--space-5);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-muted);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail-section {
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.tenant-section {
  background: var(--color-tenant-bg);
  border-color: var(--color-tenant-border);
}

.tenant-section .detail-section-header h4 {
  color: var(--color-tenant);
}

.detail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.detail-section-header h4,
.detail-section-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-section-title {
  margin-bottom: var(--space-3);
  display: block;
}

.btn-edit {
  padding: 0;
  font-size: var(--font-size-sm);
}

.tenant-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
  margin: 0;
}

.tenant-detail-grid dt {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  margin-bottom: 3px;
}

.tenant-detail-grid dd {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.payment-row {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.payment-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.payment-month {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.payment-row-top-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.payment-row-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.payment-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-field-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.payment-field-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.payment-field-note {
  font-size: var(--font-size-xs);
}

.payment-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 640px) {
  .unit-row-main {
    flex-wrap: wrap;
  }

  .unit-status {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }

  .payment-row-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

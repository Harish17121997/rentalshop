<script setup>
import { computed, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { validateForm, required, isPositiveNumber } from '@/utils/validation'
import { todayISO } from '@/utils/calculations'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  transaction: { type: Object, default: null }, // pass an existing transaction to edit it; omit to add a new one
})
const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => Boolean(props.transaction))

const form = reactive({
  companyName: props.transaction?.companyName || '',
  type: props.transaction?.type || 'IPO',
  quantity: props.transaction?.quantity ?? '',
  buyPrice: props.transaction?.buyPrice ?? '',
  buyDate: props.transaction?.buyDate || todayISO(),
  broker: props.transaction?.broker || '',
  alreadySold: Boolean(props.transaction?.sellDate),
  sellPrice: props.transaction?.sellPrice ?? '',
  sellDate: props.transaction?.sellDate || todayISO(),
})
const fieldErrors = ref({})
const saving = ref(false)
const saveError = ref('')

const buyAmount = computed(() => (Number(form.quantity) || 0) * (Number(form.buyPrice) || 0))
const sellAmount = computed(() => (Number(form.quantity) || 0) * (Number(form.sellPrice) || 0))

async function handleSave() {
  const schema = {
    companyName: [(v) => required(v, 'Company / IPO name')],
    quantity: [(v) => isPositiveNumber(v, 'Quantity')],
    buyPrice: [(v) => isPositiveNumber(v, 'Buy price')],
    buyDate: [(v) => required(v, 'Buy date')],
  }
  if (form.alreadySold) {
    schema.sellPrice = [(v) => isPositiveNumber(v, 'Sell price')]
    schema.sellDate = [(v) => required(v, 'Sell date')]
  }

  const { valid, errors } = validateForm(form, schema)
  fieldErrors.value = errors
  if (!valid) return

  saving.value = true
  saveError.value = ''
  try {
    await emit('save', {
      transactionId: props.transaction?.transactionId,
      companyName: form.companyName,
      type: form.type,
      quantity: Number(form.quantity),
      buyPrice: Number(form.buyPrice),
      buyAmount: buyAmount.value,
      buyDate: form.buyDate,
      broker: form.broker,
      sellPrice: form.alreadySold ? Number(form.sellPrice) : null,
      sellAmount: form.alreadySold ? sellAmount.value : 0,
      sellDate: form.alreadySold ? form.sellDate : null,
    })
  } catch (err) {
    saveError.value = err.message || 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :title="isEdit ? `Edit ${transaction.companyName}` : 'Add Stock / IPO Transaction'" @close="emit('close')">
    <div class="form-field">
      <label for="companyName">Company / IPO Name</label>
      <input id="companyName" v-model="form.companyName" type="text" placeholder="e.g. ABC Ltd" />
      <span v-if="fieldErrors.companyName" class="form-error">{{ fieldErrors.companyName }}</span>
    </div>

    <div class="form-field">
      <label for="type">Type</label>
      <select id="type" v-model="form.type">
        <option value="IPO">IPO</option>
        <option value="Stock Buy">Stock Buy</option>
        <option value="Dividend">Dividend</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="quantity">Quantity</label>
        <input id="quantity" v-model="form.quantity" type="number" min="0" step="1" />
        <span v-if="fieldErrors.quantity" class="form-error">{{ fieldErrors.quantity }}</span>
      </div>
      <div class="form-field">
        <label for="buyPrice">Buy Price</label>
        <input id="buyPrice" v-model="form.buyPrice" type="number" min="0" step="0.01" />
        <span v-if="fieldErrors.buyPrice" class="form-error">{{ fieldErrors.buyPrice }}</span>
      </div>
    </div>

    <p class="computed-amount text-muted">Buy Amount: <strong>{{ formatCurrency(buyAmount) }}</strong></p>

    <div class="form-field">
      <label for="buyDate">Buy Date</label>
      <input id="buyDate" v-model="form.buyDate" type="date" />
      <span v-if="fieldErrors.buyDate" class="form-error">{{ fieldErrors.buyDate }}</span>
    </div>

    <div class="form-field">
      <label for="broker">Broker / Platform</label>
      <input id="broker" v-model="form.broker" type="text" placeholder="e.g. Zerodha" />
    </div>

    <label class="checkbox-field">
      <input v-model="form.alreadySold" type="checkbox" />
      <span>Already sold</span>
    </label>

    <template v-if="form.alreadySold">
      <div class="form-row">
        <div class="form-field">
          <label for="sellPrice">Sell Price</label>
          <input id="sellPrice" v-model="form.sellPrice" type="number" min="0" step="0.01" />
          <span v-if="fieldErrors.sellPrice" class="form-error">{{ fieldErrors.sellPrice }}</span>
        </div>
        <div class="form-field">
          <label for="sellDate">Sell Date</label>
          <input id="sellDate" v-model="form.sellDate" type="date" />
          <span v-if="fieldErrors.sellDate" class="form-error">{{ fieldErrors.sellDate }}</span>
        </div>
      </div>

      <p class="computed-amount text-muted">Sell Amount: <strong>{{ formatCurrency(sellAmount) }}</strong></p>
      <p class="computed-amount text-muted">
        Profit: <strong :class="sellAmount - buyAmount >= 0 ? 'text-success' : 'text-danger'">{{ formatCurrency(sellAmount - buyAmount) }}</strong>
      </p>
    </template>

    <p v-if="saveError" class="form-error save-error">{{ saveError }}</p>

    <div class="modal-actions">
      <button class="btn btn-secondary" type="button" :disabled="saving" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="handleSave">
        <span v-if="saving" class="btn-spinner" aria-hidden="true"></span>
        {{ saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Save') }}
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.save-error {
  margin-top: var(--space-3);
  text-align: right;
}

.btn-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: var(--space-2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
  vertical-align: -1px;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.computed-amount {
  font-size: var(--font-size-sm);
  margin: calc(-1 * var(--space-2)) 0 var(--space-4);
}

.computed-amount strong {
  color: var(--color-text);
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>

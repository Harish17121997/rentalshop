<script setup>
import { computed, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { validateForm, required, isPositiveNumber } from '@/utils/validation'
import { todayISO } from '@/utils/calculations'
import { formatCurrency } from '@/utils/currency'

const emit = defineEmits(['close', 'save'])

const form = reactive({
  companyName: '',
  type: 'IPO',
  quantity: '',
  buyPrice: '',
  buyDate: todayISO(),
  broker: '',
  alreadySold: false,
  sellPrice: '',
  sellDate: todayISO(),
})
const fieldErrors = ref({})
const saving = ref(false)

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
  try {
    await emit('save', {
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
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal title="Add Stock / IPO Transaction" @close="emit('close')">
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

    <div class="modal-actions">
      <button class="btn btn-secondary" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="handleSave">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
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

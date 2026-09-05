<script setup>
import { computed, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { formatCurrency } from '@/utils/currency'
import { validateForm, isPositiveNumber, required } from '@/utils/validation'
import { todayISO } from '@/utils/calculations'

const props = defineProps({
  transaction: { type: Object, required: true },
})
const emit = defineEmits(['close', 'save'])

const form = reactive({
  sellPrice: '',
  sellDate: todayISO(),
})
const fieldErrors = ref({})
const saving = ref(false)

const sellAmount = computed(() => (Number(props.transaction.quantity) || 0) * (Number(form.sellPrice) || 0))
const estimatedProfit = computed(() => sellAmount.value - (Number(props.transaction.buyAmount) || 0))

async function handleSave() {
  const { valid, errors } = validateForm(form, {
    sellPrice: [(v) => isPositiveNumber(v, 'Sell price')],
    sellDate: [(v) => required(v, 'Sell date')],
  })
  fieldErrors.value = errors
  if (!valid) return

  saving.value = true
  try {
    await emit('save', {
      sellPrice: Number(form.sellPrice),
      sellAmount: sellAmount.value,
      sellDate: form.sellDate,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :title="`Record Sale — ${transaction.companyName}`" @close="emit('close')">
    <p class="text-muted buy-line">
      Bought {{ transaction.quantity }} @ {{ formatCurrency(transaction.buyPrice, { decimals: true }) }}
      ({{ formatCurrency(transaction.buyAmount) }})
    </p>

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

    <p class="computed-amount">
      Profit:
      <strong :class="estimatedProfit >= 0 ? 'text-success' : 'text-danger'">{{ formatCurrency(estimatedProfit) }}</strong>
    </p>

    <div class="modal-actions">
      <button class="btn btn-secondary" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="handleSave">
        {{ saving ? 'Saving...' : 'Save Sale' }}
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.buy-line {
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

.computed-amount {
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>

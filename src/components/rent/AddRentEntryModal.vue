<script setup>
import { reactive, ref, watch, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { validateForm, required, isPositiveNumber } from '@/utils/validation'
import { todayISO } from '@/utils/calculations'

const props = defineProps({
  units: { type: Array, required: true },
  initialUnitId: { type: String, default: '' },
  payment: { type: Object, default: null }, // pass an existing payment to correct it; omit to log a new one
})
const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => Boolean(props.payment))

const form = reactive({
  unitId: props.payment?.unitId || props.initialUnitId || props.units[0]?.unitId || '',
  amount: props.payment?.paidAmount ?? '',
  date: props.payment?.paidDate || todayISO(),
  method: props.payment?.paymentMethod || 'Cash',
  description: props.payment?.description || '',
})
const fieldErrors = ref({})
const saving = ref(false)
const saveError = ref('')

const selectedUnit = ref(props.units.find((u) => u.unitId === form.unitId) || null)

// Picking a unit prefills its monthly rent — user can still edit the amount before saving.
// Skipped in edit mode: the amount is already set from the payment being corrected.
watch(
  () => form.unitId,
  (unitId) => {
    selectedUnit.value = props.units.find((u) => u.unitId === unitId) || null
    if (selectedUnit.value && !isEdit.value) {
      form.amount = selectedUnit.value.monthlyRent
    }
  },
  { immediate: true },
)

async function handleSave() {
  const { valid, errors } = validateForm(form, {
    unitId: [(v) => required(v, 'Unit')],
    amount: [(v) => isPositiveNumber(v, 'Amount')],
    date: [(v) => required(v, 'Date')],
  })
  fieldErrors.value = errors
  if (!valid) return

  saving.value = true
  saveError.value = ''
  try {
    await emit('save', {
      unit: selectedUnit.value,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      description: form.description,
    })
  } catch (err) {
    saveError.value = err.message || 'Failed to save. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :title="isEdit ? 'Edit Rent Entry' : 'Add Rent Entry'" @close="emit('close')">
    <div class="form-field">
      <label for="unitId">Shop / House</label>
      <select id="unitId" v-model="form.unitId" :disabled="isEdit">
        <option v-for="unit in units" :key="unit.unitId" :value="unit.unitId">
          {{ unit.unitName }}<template v-if="unit.category"> ({{ unit.category }})</template>
        </option>
      </select>
      <span v-if="fieldErrors.unitId" class="form-error">{{ fieldErrors.unitId }}</span>
    </div>

    <div class="form-field">
      <label for="date">Date</label>
      <input id="date" v-model="form.date" type="date" />
      <span v-if="fieldErrors.date" class="form-error">{{ fieldErrors.date }}</span>
    </div>

    <div class="form-field">
      <label for="amount">Amount</label>
      <input id="amount" v-model.number="form.amount" type="number" min="0" step="1" />
      <span v-if="fieldErrors.amount" class="form-error">{{ fieldErrors.amount }}</span>
    </div>

    <div class="form-field">
      <label for="method">Payment Method</label>
      <select id="method" v-model="form.method">
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Bank">Bank</option>
        <option value="Cheque">Cheque</option>
      </select>
    </div>

    <div class="form-field">
      <label for="description">Description</label>
      <textarea id="description" v-model="form.description" rows="2" placeholder="e.g. August rent" />
    </div>

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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>

<script setup>
import { reactive, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { validateForm, required, isPositiveNumber } from '@/utils/validation'
import { todayISO } from '@/utils/calculations'

const props = defineProps({
  units: { type: Array, required: true },
  initialUnitId: { type: String, default: '' },
})
const emit = defineEmits(['close', 'save'])

const form = reactive({
  unitId: props.initialUnitId || props.units[0]?.unitId || '',
  amount: '',
  date: todayISO(),
  description: '',
})
const fieldErrors = ref({})
const saving = ref(false)

const selectedUnit = ref(props.units.find((u) => u.unitId === form.unitId) || null)

// Picking a unit prefills its monthly rent — user can still edit the amount before saving.
watch(
  () => form.unitId,
  (unitId) => {
    selectedUnit.value = props.units.find((u) => u.unitId === unitId) || null
    if (selectedUnit.value) {
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
  try {
    await emit('save', {
      unit: selectedUnit.value,
      amount: Number(form.amount),
      date: form.date,
      method: 'Cash',
      description: form.description,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal title="Add Rent Entry" @close="emit('close')">
    <div class="form-field">
      <label for="unitId">Shop / House</label>
      <select id="unitId" v-model="form.unitId">
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
      <label for="description">Description</label>
      <textarea id="description" v-model="form.description" rows="2" placeholder="e.g. August rent" />
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="handleSave">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>

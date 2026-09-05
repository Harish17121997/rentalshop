<script setup>
import { reactive, ref, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { validateForm, required, isPositiveNumber, isNonNegativeNumber, isValidPhone, isValidAadhar } from '@/utils/validation'

const props = defineProps({
  category: { type: String, default: 'House' }, // 'Shop' | 'House' — fixed for edits, chosen once for new units
  unit: { type: Object, default: null }, // pass an existing unit to edit it; omit to add a new one
})
const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => Boolean(props.unit))

const form = reactive({
  unitName: props.unit?.unitName || '',
  location: props.unit?.location || '',
  monthlyRent: props.unit?.monthlyRent ?? '',
  deposit: props.unit?.deposit ?? '',
  status: props.unit?.status || 'Rented',
  tenantName: props.unit?.tenantName || '',
  tenantPhone: props.unit?.tenantPhone || '',
  tenantAadhar: props.unit?.tenantAadhar || '',
  agreementDate: props.unit?.agreementDate || '',
})
const fieldErrors = ref({})
const saving = ref(false)

async function handleSave() {
  const { valid, errors } = validateForm(form, {
    unitName: [(v) => required(v, 'Name')],
    monthlyRent: [(v) => isPositiveNumber(v, 'Monthly rent')],
    deposit: [(v) => (v === '' ? '' : isNonNegativeNumber(v, 'Deposit'))],
    tenantPhone: [(v) => (form.status === 'Vacant' ? '' : isValidPhone(v))],
    tenantAadhar: [(v) => (form.status === 'Vacant' ? '' : isValidAadhar(v))],
  })
  fieldErrors.value = errors
  if (!valid) return

  saving.value = true
  try {
    await emit('save', {
      ...form,
      category: props.unit?.category || props.category,
      monthlyRent: Number(form.monthlyRent),
      deposit: Number(form.deposit) || 0,
      tenantName: form.status === 'Vacant' ? '' : form.tenantName,
      tenantPhone: form.status === 'Vacant' ? '' : form.tenantPhone,
      tenantAadhar: form.status === 'Vacant' ? '' : form.tenantAadhar,
      agreementDate: form.status === 'Vacant' ? null : form.agreementDate,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :title="isEdit ? `Edit ${unit.unitName}` : `Add ${category}`" @close="emit('close')">
    <div class="form-field">
      <label for="unitName">Name</label>
      <input id="unitName" v-model="form.unitName" type="text" placeholder="e.g. House 2" />
      <span v-if="fieldErrors.unitName" class="form-error">{{ fieldErrors.unitName }}</span>
    </div>

    <div class="form-field">
      <label for="location">Location</label>
      <input id="location" v-model="form.location" type="text" placeholder="e.g. Green Colony" />
    </div>

    <div class="form-field">
      <label for="monthlyRent">Rent</label>
      <input id="monthlyRent" v-model="form.monthlyRent" type="number" min="0" step="1" />
      <span v-if="fieldErrors.monthlyRent" class="form-error">{{ fieldErrors.monthlyRent }}</span>
    </div>

    <div class="form-field">
      <label for="deposit">Deposit</label>
      <input id="deposit" v-model="form.deposit" type="number" min="0" step="1" />
      <span v-if="fieldErrors.deposit" class="form-error">{{ fieldErrors.deposit }}</span>
    </div>

    <div class="form-field">
      <label for="status">Status</label>
      <select id="status" v-model="form.status">
        <option value="Rented">Rented</option>
        <option value="Vacant">Vacant</option>
      </select>
    </div>

    <template v-if="form.status !== 'Vacant'">
      <div class="form-field">
        <label for="tenantName">Tenant Name</label>
        <input id="tenantName" v-model="form.tenantName" type="text" />
      </div>

      <div class="form-field">
        <label for="tenantPhone">Tenant Phone</label>
        <input id="tenantPhone" v-model="form.tenantPhone" type="tel" placeholder="10-digit number" />
        <span v-if="fieldErrors.tenantPhone" class="form-error">{{ fieldErrors.tenantPhone }}</span>
      </div>

      <div class="form-field">
        <label for="tenantAadhar">Aadhar Card Number</label>
        <input id="tenantAadhar" v-model="form.tenantAadhar" type="text" placeholder="12-digit Aadhar number" inputmode="numeric" />
        <span v-if="fieldErrors.tenantAadhar" class="form-error">{{ fieldErrors.tenantAadhar }}</span>
      </div>

      <div class="form-field">
        <label for="agreementDate">Agreement / Shop Given Date</label>
        <input id="agreementDate" v-model="form.agreementDate" type="date" />
      </div>
    </template>

    <div class="modal-actions">
      <button class="btn btn-secondary" type="button" @click="emit('close')">Cancel</button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="handleSave">
        {{ saving ? 'Saving...' : (isEdit ? 'Save Changes' : `Add ${category}`) }}
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

export function required(value, label = 'This field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} is required`
  }
  return ''
}

export function isPositiveNumber(value, label = 'Amount') {
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    return `${label} must be a positive number`
  }
  return ''
}

export function isNonNegativeNumber(value, label = 'Amount') {
  const num = Number(value)
  if (Number.isNaN(num) || num < 0) {
    return `${label} cannot be negative`
  }
  return ''
}

export function isValidEmail(value) {
  if (!value) return ''
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) ? '' : 'Enter a valid email address'
}

export function isValidPhone(value) {
  if (!value) return ''
  const digitsOnly = String(value).replace(/\D/g, '')
  return digitsOnly.length >= 10 ? '' : 'Enter a valid phone number'
}

export function isValidAadhar(value) {
  if (!value) return ''
  const digitsOnly = String(value).replace(/\D/g, '')
  return digitsOnly.length === 12 ? '' : 'Aadhar number must be 12 digits'
}

/**
 * Runs a set of {field, rules} validators against a form object.
 * Returns { valid, errors } where errors is keyed by field name.
 */
export function validateForm(form, schema) {
  const errors = {}
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const message = rule(form[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

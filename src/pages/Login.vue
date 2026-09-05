<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { validateForm, required } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const { login, loading, error } = useAuth()

const form = reactive({ username: '', password: '' })
const fieldErrors = ref({})

async function handleSubmit() {
  const { valid, errors } = validateForm(form, {
    username: [(v) => required(v, 'Username')],
    password: [(v) => required(v, 'Password')],
  })
  fieldErrors.value = errors
  if (!valid) return

  const success = await login(form.username, form.password)
  if (success) {
    router.push(route.query.redirect || { name: 'dashboard' })
  }
}
</script>

<template>
  <div class="login-card card">
    <div class="login-header">
      <span class="brand-mark">₹</span>
      <h1>Kadam Complex Kinwat</h1>
      <p class="text-muted">Sign in to manage your properties and investments</p>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="username">Username / Email</label>
        <input id="username" v-model="form.username" type="text" autocomplete="username" />
        <span v-if="fieldErrors.username" class="form-error">{{ fieldErrors.username }}</span>
      </div>

      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" />
        <span v-if="fieldErrors.password" class="form-error">{{ fieldErrors.password }}</span>
      </div>

      <p v-if="error" class="form-error login-error">{{ error }}</p>

      <button class="btn btn-primary login-submit" type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  padding: var(--space-6);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-3);
}

.login-header h1 {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--space-1);
}

.login-header p {
  font-size: var(--font-size-sm);
}

.login-submit {
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-3);
}

.login-error {
  text-align: center;
  margin-bottom: var(--space-3);
}
</style>

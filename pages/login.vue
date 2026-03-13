<script setup lang="ts">
import { motion } from 'motion-v'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import { demoLoginOptions, joinInvites, APP_NAME, APP_ROUTES, seedUsers } from '~/shared/app/data'
import { getLanguageMeta, t } from '~/shared/app/i18n'
import { findUserById, LAST_ACCOUNT_ID_KEY } from '~/shared/app/session'
import { accessCodeLoginSchema, credentialLoginSchema } from '~/shared/app/validation'

definePageMeta({ guestOnly: true })

const { language, applyLanguage } = useSchoolLanguage()
const {
  consumeAuthError,
  signInWithAccessCode,
  signInWithBiometricAuth,
  signInWithCredentials,
  sendRecovery
} = useSchoolSession()

const authMode = ref<'credentials' | 'access-code' | 'qr'>('credentials')
const errorMessage = ref('')
const recoveryMessage = ref('')
const biometricMessage = ref('')
const showRecovery = ref(false)

const schoolCode = ref('')
const email = ref('')
const password = ref('')
const accessCode = ref('')

const biometricReady = computed(() => {
  if (!import.meta.client) {
    return false
  }

  const lastAccountId = window.localStorage.getItem(LAST_ACCOUNT_ID_KEY)
  const account = findUserById(lastAccountId, seedUsers)
  return Boolean(account?.biometricEnabled)
})

const helperText = computed(() => {
  if (authMode.value === 'access-code') return t(language.value, 'auth.accessHint')
  if (authMode.value === 'qr') return t(language.value, 'auth.qrHint')
  return t(language.value, 'auth.loginHint')
})

function applyDemo(index: number) {
  const option = demoLoginOptions[index]
  if (!option) {
    return
  }

  schoolCode.value = option.schoolCode
  email.value = option.email
  password.value = option.password
  accessCode.value = option.accessCode
  if (authMode.value === 'qr') {
    authMode.value = 'credentials'
  }
}

async function submitCredentials() {
  errorMessage.value = ''
  const parsed = credentialLoginSchema.safeParse({
    schoolCode: schoolCode.value,
    email: email.value,
    password: password.value
  })

  if (!parsed.success) {
    errorMessage.value = 'Please enter a valid school code, email, and password.'
    return
  }

  const result = signInWithCredentials(parsed.data)
  if (!result.ok) {
    errorMessage.value = result.error
    return
  }

  await navigateTo(result.redirectTo)
}

async function submitAccessCode() {
  errorMessage.value = ''
  const parsed = accessCodeLoginSchema.safeParse({
    schoolCode: schoolCode.value,
    accessCode: accessCode.value
  })

  if (!parsed.success) {
    errorMessage.value = 'Please enter a valid school code and unique code.'
    return
  }

  const result = signInWithAccessCode(parsed.data)
  if (!result.ok) {
    errorMessage.value = result.error
    return
  }

  await navigateTo(result.redirectTo)
}

async function handleSubmit() {
  if (authMode.value === 'access-code') {
    await submitAccessCode()
    return
  }

  await submitCredentials()
}

async function handleBiometric() {
  biometricMessage.value = ''
  const result = signInWithBiometricAuth()
  if (!result.ok) {
    biometricMessage.value = result.error
    return
  }

  await navigateTo(result.redirectTo)
}

function handleRecovery(channel: 'sms' | 'whatsapp') {
  recoveryMessage.value = sendRecovery({
    schoolCode: schoolCode.value,
    email: email.value,
    channel
  }).message
}

onMounted(() => {
  errorMessage.value = consumeAuthError()
})
</script>

<template>
  <main class="login-shell" :dir="getLanguageMeta(language).dir">
    <motion.section class="login-hero" :initial="{ opacity: 0, x: -18 }" :animate="{ opacity: 1, x: 0 }" :transition="{ duration: 0.35 }">
      <LanguageSwitcher :model-value="language" @update:model-value="applyLanguage" />
      <div class="brand-chip">{{ t(language, 'auth.chip') }}</div>
      <h1>{{ t(language, 'auth.title') }}</h1>
      <p>{{ t(language, 'auth.body') }}</p>
      <div class="hero-panel">
        <p class="hero-panel__label">{{ t(language, 'auth.roleList') }}</p>
        <ul class="hero-list">
          <li>Super Admin and School Admin</li>
          <li>Teacher and Parent</li>
          <li>Transport Driver and Supervisor</li>
        </ul>
      </div>
    </motion.section>

    <motion.section class="login-card" :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }">
      <div class="login-card__header">
        <p class="eyebrow">{{ APP_NAME }}</p>
        <h2>{{ t(language, 'auth.signInTitle') }}</h2>
        <p>
          {{ authMode === 'access-code' ? t(language, 'auth.accessCodeBody') : authMode === 'qr' ? t(language, 'auth.qrBody') : t(language, 'auth.signInBody') }}
        </p>
      </div>

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab" :class="{ 'auth-tab--active': authMode === 'credentials' }" type="button" @click="authMode = 'credentials'">{{ t(language, 'auth.codeTab') }}</button>
        <button class="auth-tab" :class="{ 'auth-tab--active': authMode === 'access-code' }" type="button" @click="authMode = 'access-code'">{{ t(language, 'auth.accessCodeTab') }}</button>
        <button class="auth-tab" :class="{ 'auth-tab--active': authMode === 'qr' }" type="button" @click="authMode = 'qr'">{{ t(language, 'auth.qrTab') }}</button>
      </div>

      <div v-if="authMode === 'qr'" class="qr-grid">
        <div class="section-copy section-copy--tight">
          <p class="eyebrow">{{ t(language, 'auth.qrTitle') }}</p>
          <h3>{{ t(language, 'auth.qrTitle') }}</h3>
          <p>{{ t(language, 'auth.qrBody') }}</p>
        </div>
        <article v-for="invite in joinInvites" :key="invite.inviteCode" class="qr-card">
          <div class="qr-card__visual" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <p class="eyebrow">{{ invite.schoolName }}</p>
          <h3>{{ invite.title }}</h3>
          <p>{{ invite.linkedChildren.join(', ') }}</p>
          <NuxtLink class="button button--secondary" :to="`${APP_ROUTES.join}?invite=${encodeURIComponent(invite.inviteCode)}`">{{ t(language, 'auth.join') }}</NuxtLink>
        </article>
      </div>

      <form v-else class="login-form" novalidate @submit.prevent="handleSubmit">
        <label>
          <span>{{ t(language, 'auth.schoolCode') }}</span>
          <input v-model="schoolCode" name="schoolCode" type="text" placeholder="SUMMIT or PLATFORM" autocomplete="organization" required />
        </label>

        <template v-if="authMode === 'credentials'">
          <label>
            <span>{{ t(language, 'auth.email') }}</span>
            <input v-model="email" name="email" type="email" placeholder="user@school.test" autocomplete="username" required />
          </label>
          <label>
            <span>{{ t(language, 'auth.password') }}</span>
            <input v-model="password" name="password" type="password" placeholder="Enter password" autocomplete="current-password" required />
          </label>
        </template>

        <template v-else>
          <label>
            <span>{{ t(language, 'auth.accessCode') }}</span>
            <input v-model="accessCode" name="accessCode" type="text" placeholder="SUMMIT-FAMILY-1101" autocomplete="one-time-code" required />
          </label>
        </template>

        <p class="form-message" :class="{ 'form-message--error': errorMessage }" role="alert">{{ errorMessage || helperText }}</p>
        <button class="button button--primary" type="submit">{{ t(language, 'auth.continue') }}</button>
      </form>

      <div v-if="biometricReady" class="biometric-block">
        <p>{{ t(language, 'auth.biometricBody') }}</p>
        <button class="button button--ghost" type="button" @click="handleBiometric">{{ t(language, 'auth.biometric') }}</button>
        <p v-if="biometricMessage" class="form-message">{{ biometricMessage }}</p>
      </div>

      <button class="text-button" type="button" @click="showRecovery = !showRecovery">{{ t(language, 'auth.forgotPassword') }}</button>
      <div v-if="showRecovery" class="recovery-panel">
        <div>
          <h3>{{ t(language, 'auth.recoveryTitle') }}</h3>
          <p>{{ t(language, 'auth.recoveryBody') }}</p>
        </div>
        <div class="recovery-panel__actions">
          <button class="button button--secondary" type="button" @click="handleRecovery('sms')">{{ t(language, 'auth.sms') }}</button>
          <button class="button button--secondary" type="button" @click="handleRecovery('whatsapp')">{{ t(language, 'auth.whatsapp') }}</button>
        </div>
        <p v-if="recoveryMessage" class="form-message">{{ recoveryMessage }}</p>
      </div>

      <div class="demo-block">
        <div class="demo-block__header">
          <h3>{{ t(language, 'auth.demoTitle') }}</h3>
          <p>{{ t(language, 'auth.demoBody') }}</p>
        </div>
        <div class="demo-grid demo-grid--wide">
          <button v-for="(option, index) in demoLoginOptions" :key="option.email" class="demo-card" type="button" @click="applyDemo(index)">
            <span class="demo-card__title">{{ option.label }}</span>
            <span class="demo-card__badge">{{ option.roleLabel }}</span>
            <span class="demo-card__body">{{ option.summary }}</span>
            <span class="demo-card__meta">{{ option.schoolCode }} · {{ option.email }}</span>
          </button>
        </div>
      </div>
    </motion.section>
  </main>
</template>


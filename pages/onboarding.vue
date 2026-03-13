<script setup lang="ts">
import { motion } from 'motion-v'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import { APP_NAME } from '~/shared/app/data'
import { getLanguageMeta, t } from '~/shared/app/i18n'

definePageMeta({ onboardingOnly: true })

const { language, applyLanguage } = useSchoolLanguage()
const { account, finishOnboarding } = useSchoolSession()
const stepIndex = ref(0)

const slides = computed(() => t(language.value, 'onboarding.slides') as Array<{ title: string; body: string }>)
const slide = computed(() => slides.value[Math.min(stepIndex.value, slides.value.length - 1)] ?? { title: '', body: '' })

function goBack() {
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}

async function goNext() {
  if (stepIndex.value >= slides.value.length - 1) {
    const redirectTo = finishOnboarding()
    await navigateTo(redirectTo)
    return
  }

  stepIndex.value += 1
}

async function skip() {
  const redirectTo = finishOnboarding()
  await navigateTo(redirectTo)
}
</script>

<template>
  <main class="onboarding-shell" :dir="getLanguageMeta(language).dir">
    <motion.section class="onboarding-card" :initial="{ opacity: 0, scale: 0.98 }" :animate="{ opacity: 1, scale: 1 }" :transition="{ duration: 0.35 }">
      <LanguageSwitcher :model-value="language" @update:model-value="applyLanguage" />
      <p class="eyebrow">{{ APP_NAME }}</p>
      <h1>{{ t(language, 'onboarding.title') }}</h1>
      <p>{{ t(language, 'onboarding.subtitle') }}</p>
      <div class="onboarding-stage">
        <span class="step-pill">{{ t(language, 'onboarding.step') }} {{ stepIndex + 1 }}/{{ slides.length }}</span>
        <h2>{{ slide.title }}</h2>
        <p>{{ slide.body }}</p>
        <div class="onboarding-welcome">{{ account?.profile.displayName }}</div>
      </div>
      <div class="onboarding-dots">
        <span v-for="(_, index) in slides" :key="index" class="onboarding-dot" :class="{ 'onboarding-dot--active': index === stepIndex }" />
      </div>
      <div class="onboarding-actions">
        <button class="button button--ghost" type="button" @click="goBack">{{ t(language, 'onboarding.back') }}</button>
        <button class="button button--secondary" type="button" @click="skip">{{ t(language, 'onboarding.skip') }}</button>
        <button class="button button--primary" type="button" @click="goNext">{{ stepIndex === slides.length - 1 ? t(language, 'onboarding.finish') : t(language, 'onboarding.next') }}</button>
      </div>
    </motion.section>
  </main>
</template>

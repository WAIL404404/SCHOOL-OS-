<script setup lang="ts">
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import { APP_NAME, APP_ROUTES } from '~/shared/app/data'
import { findJoinInvite } from '~/shared/app/session'
import { getLanguageMeta, t } from '~/shared/app/i18n'

definePageMeta({ guestOnly: true })

const route = useRoute()
const { language, applyLanguage } = useSchoolLanguage()
const { signInWithQrInvite } = useSchoolSession()

const invite = computed(() => findJoinInvite(typeof route.query.invite === 'string' ? route.query.invite : null))

async function acceptInvite() {
  const result = signInWithQrInvite(invite.value?.inviteCode)
  if (result.ok) {
    await navigateTo(result.redirectTo)
  } else {
    await navigateTo(APP_ROUTES.login)
  }
}
</script>

<template>
  <main class="join-shell" :dir="getLanguageMeta(language).dir">
    <section class="join-card">
      <LanguageSwitcher :model-value="language" @update:model-value="applyLanguage" />
      <template v-if="invite">
        <p class="eyebrow">{{ APP_NAME }}</p>
        <h1>{{ t(language, 'join.title') }}</h1>
        <p>{{ t(language, 'join.subtitle') }}</p>
        <div class="join-grid">
          <article class="panel-card panel-card--inner">
            <p class="eyebrow">{{ t(language, 'join.linkedChildren') }}</p>
            <h3>{{ invite.title }}</h3>
            <ul class="plain-list">
              <li v-for="item in invite.linkedChildren" :key="item">{{ item }}</li>
            </ul>
          </article>
          <article class="panel-card panel-card--inner">
            <p class="eyebrow">{{ t(language, 'join.linkedSchools') }}</p>
            <ul class="plain-list">
              <li v-for="item in invite.linkedSchools" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
        <div class="join-actions">
          <button class="button button--primary" type="button" @click="acceptInvite">{{ t(language, 'join.continue') }}</button>
          <NuxtLink class="button button--ghost" :to="APP_ROUTES.login">{{ t(language, 'join.back') }}</NuxtLink>
        </div>
      </template>
      <template v-else>
        <p class="eyebrow">{{ APP_NAME }}</p>
        <h1>{{ t(language, 'join.title') }}</h1>
        <p>{{ t(language, 'join.invalid') }}</p>
        <NuxtLink class="button button--secondary" :to="APP_ROUTES.login">{{ t(language, 'join.back') }}</NuxtLink>
      </template>
    </section>
  </main>
</template>

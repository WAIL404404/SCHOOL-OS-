<script setup lang="ts">
import { navigationByRole, APP_NAME } from '~/shared/app/data'
import type { SupportedLanguage } from '~/shared/app/i18n'
import type { RoleWorkspaceView, UserRole } from '~/shared/app/types'

const props = defineProps<{
  viewModel: RoleWorkspaceView
  activeRoute: string
  language: SupportedLanguage
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <p class="eyebrow">{{ APP_NAME }}</p>
      <h1>{{ props.viewModel.school.name }}</h1>
      <p>{{ props.viewModel.school.campus }}</p>
      <span class="role-chip">{{ props.viewModel.roleLabel }}</span>
    </div>

    <nav class="sidebar__nav" aria-label="Role navigation">
      <NuxtLink
        v-for="item in navigationByRole[props.viewModel.role as UserRole]"
        :key="item.route"
        class="nav-link"
        :class="{ 'nav-link--active': item.route === props.activeRoute }"
        :to="item.route"
      >
        <span>{{ item.label }}</span>
        <small>{{ item.description }}</small>
      </NuxtLink>
    </nav>

    <div class="sidebar__footer">
      <p>Support</p>
      <a :href="`mailto:${props.viewModel.school.supportEmail}`">{{ props.viewModel.school.supportEmail }}</a>
    </div>
  </aside>
</template>

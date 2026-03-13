<script setup lang="ts">
import type { RoleWorkspaceView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: RoleWorkspaceView
  eyebrow: string
}>()

const emit = defineEmits<{
  logout: []
}>()
</script>

<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">{{ props.eyebrow }}</p>
      <h2>Welcome back, {{ props.viewModel.displayName }}</h2>
      <p>{{ props.viewModel.school.greeting || props.viewModel.description }}</p>
    </div>
    <div class="topbar__actions">
      <span class="role-chip role-chip--light">{{ props.viewModel.roleLabel }}</span>
      <button id="logout-button" class="button button--ghost" type="button" @click="emit('logout')">Sign out</button>
    </div>
  </header>
</template>

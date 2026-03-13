<script setup lang="ts">
import RoleWorkspaceScreen from '~/components/RoleWorkspaceScreen.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'

definePageMeta({ pageRole: USER_ROLES.supervisor })
</script>

<template>
  <RoleWorkspaceScreen :role="USER_ROLES.supervisor" :active-route="APP_ROUTES.supervisorOverview" eyebrow="Supervisor workspace" />
</template>

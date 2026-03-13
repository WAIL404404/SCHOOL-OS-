<script setup lang="ts">
import RoleWorkspaceScreen from '~/components/RoleWorkspaceScreen.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'

definePageMeta({ pageRole: USER_ROLES.superAdmin })
</script>

<template>
  <RoleWorkspaceScreen :role="USER_ROLES.superAdmin" :active-route="APP_ROUTES.superAdminOverview" eyebrow="Super Admin workspace" />
</template>

<script setup lang="ts">
import RoleWorkspaceScreen from '~/components/RoleWorkspaceScreen.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'

definePageMeta({ pageRole: USER_ROLES.schoolAdmin })
</script>

<template>
  <RoleWorkspaceScreen :role="USER_ROLES.schoolAdmin" :active-route="APP_ROUTES.schoolAdminOverview" eyebrow="School Admin workspace" />
</template>

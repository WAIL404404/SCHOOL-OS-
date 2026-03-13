<script setup lang="ts">
import RoleWorkspaceScreen from '~/components/RoleWorkspaceScreen.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'

definePageMeta({ pageRole: USER_ROLES.transportDriver })
</script>

<template>
  <RoleWorkspaceScreen :role="USER_ROLES.transportDriver" :active-route="APP_ROUTES.driverOverview" eyebrow="Transport Driver workspace" />
</template>

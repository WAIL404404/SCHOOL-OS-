<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import SuperAdminPanelSections from '~/components/SuperAdminPanelSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildRoleWorkspaceView, buildSuperAdminPanelView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.superAdmin })

const { account, removeDevice, signOut } = useSchoolSession()
const workspaceView = computed(() => buildRoleWorkspaceView(account.value))
const adminView = computed(() => buildSuperAdminPanelView(account.value))

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.superAdminOverview" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="Super admin control center" @logout="handleLogout" />
      <SuperAdminPanelSections :view-model="adminView" />
      <DeviceSection :devices="adminView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

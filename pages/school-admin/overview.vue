<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import SchoolAdminPanelSections from '~/components/SchoolAdminPanelSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildRoleWorkspaceView, buildSchoolAdminPanelView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.schoolAdmin })

const { account, removeDevice, signOut } = useSchoolSession()

const workspaceView = computed(() => buildRoleWorkspaceView(account.value))
const adminPanelView = computed(() => buildSchoolAdminPanelView(account.value))

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.schoolAdminOverview" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="School admin workspace" @logout="handleLogout" />
      <SchoolAdminPanelSections :view-model="adminPanelView" />
      <DeviceSection :devices="adminPanelView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

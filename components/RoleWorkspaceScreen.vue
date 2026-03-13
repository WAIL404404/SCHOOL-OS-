<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import RoleWorkspacePanel from '~/components/RoleWorkspacePanel.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildRoleWorkspaceView } from '~/shared/app/view-models'

const props = defineProps<{
  role: typeof USER_ROLES[keyof typeof USER_ROLES]
  activeRoute: string
  eyebrow: string
}>()

const { account, removeDevice, signOut } = useSchoolSession()
const workspaceView = computed(() => buildRoleWorkspaceView(account.value))

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="props.activeRoute" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" :eyebrow="props.eyebrow" @logout="handleLogout" />
      <RoleWorkspacePanel :view-model="workspaceView" />
      <DeviceSection :devices="workspaceView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

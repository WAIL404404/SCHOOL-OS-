<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentDashboardSections from '~/components/ParentDashboardSections.vue'
import ParentModulePreview from '~/components/ParentModulePreview.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildParentDashboardView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const { parentAccount, signOut, removeDevice } = useSchoolSession()

const selectedChildId = computed(() => (typeof route.query.child === 'string' ? route.query.child : null))
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const dashboardView = computed(() => buildParentDashboardView(parentAccount.value, selectedChildId.value))

function selectChild(childId: string) {
  navigateTo({ path: APP_ROUTES.parentDashboard, query: { child: childId } })
}

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.parentDashboard" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="Parent dashboard" @logout="handleLogout" />
      <ParentModulePreview :active-route="APP_ROUTES.parentDashboard" />
      <ParentDashboardSections :view-model="dashboardView" @select-child="selectChild" />
      <DeviceSection :devices="dashboardView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentTransportSections from '~/components/ParentTransportSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildParentTransportView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const { parentAccount, removeDevice, signOut } = useSchoolSession()

const selectedChildId = computed(() => (typeof route.query.child === 'string' ? route.query.child : null))
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const transportView = computed(() => buildParentTransportView(parentAccount.value, selectedChildId.value))

function selectChild(childId: string) {
  navigateTo({ path: APP_ROUTES.transport, query: { child: childId } })
}

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.transport" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="Transport workspace" @logout="handleLogout" />
      <ParentTransportSections :view-model="transportView" @select-child="selectChild" />
      <DeviceSection :devices="transportView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

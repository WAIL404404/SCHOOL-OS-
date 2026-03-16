<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentContractsSections from '~/components/ParentContractsSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildParentContractsView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const { parentAccount, removeDevice, signOut } = useSchoolSession()

const selectedChildId = computed(() => (typeof route.query.child === 'string' ? route.query.child : null))
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const contractsView = computed(() => buildParentContractsView(parentAccount.value, selectedChildId.value))

function selectChild(childId: string) {
  navigateTo({ path: APP_ROUTES.contracts, query: { child: childId } })
}

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.contracts" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="Contracts workspace" @logout="handleLogout" />
      <ParentContractsSections :view-model="contractsView" @select-child="selectChild" />
      <DeviceSection :devices="contractsView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentFinancialSections from '~/components/ParentFinancialSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildParentFinancialView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const { parentAccount, removeDevice, signOut } = useSchoolSession()

const selectedChildId = computed(() => (typeof route.query.child === 'string' ? route.query.child : null))
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const financialView = computed(() => buildParentFinancialView(parentAccount.value, selectedChildId.value))

function selectChild(childId: string) {
  navigateTo({ path: APP_ROUTES.fees, query: { child: childId } })
}

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.fees" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="Financial workspace" @logout="handleLogout" />
      <ParentFinancialSections :view-model="financialView" @select-child="selectChild" />
      <DeviceSection :devices="financialView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

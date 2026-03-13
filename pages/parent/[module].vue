<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentModulePreview from '~/components/ParentModulePreview.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { navigationByRole, USER_ROLES, APP_ROUTES } from '~/shared/app/data'
import { buildParentDashboardView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const moduleKey = computed(() => (typeof route.params.module === 'string' ? route.params.module : 'contracts'))
const activeRoute = computed(() => `/parent/${moduleKey.value}`)
const { parentAccount, removeDevice, signOut } = useSchoolSession()
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const dashboardView = computed(() => buildParentDashboardView(parentAccount.value, typeof route.query.child === 'string' ? route.query.child : null))
const moduleLabel = computed(() => navigationByRole.parent.find((item) => item.route === activeRoute.value)?.label ?? 'Module')

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="activeRoute" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" :eyebrow="`${moduleLabel} workspace`" @logout="handleLogout" />
      <ParentModulePreview :active-route="activeRoute" />
      <section class="section-block section-block--preview">
        <div class="section-copy">
          <p class="eyebrow">{{ moduleLabel }}</p>
          <h2>{{ moduleLabel }} is prepared for the next iteration</h2>
          <p>This route remains available so the parent navigation and information architecture stay stable during the Nuxt migration.</p>
        </div>
      </section>
      <DeviceSection :devices="dashboardView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

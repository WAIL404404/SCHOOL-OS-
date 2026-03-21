<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import DeviceSection from '~/components/DeviceSection.vue'
import ParentSchoolProfileSections from '~/components/ParentSchoolProfileSections.vue'
import WorkspaceTopbar from '~/components/WorkspaceTopbar.vue'
import { APP_ROUTES, USER_ROLES } from '~/shared/app/data'
import { buildParentSchoolProfileView, buildRoleWorkspaceView } from '~/shared/app/view-models'

definePageMeta({ pageRole: USER_ROLES.parent })

const route = useRoute()
const { parentAccount, removeDevice, signOut } = useSchoolSession()

const selectedSchoolId = computed(() => (typeof route.query.school === 'string' ? route.query.school : null))
const workspaceView = computed(() => buildRoleWorkspaceView(parentAccount.value))
const schoolProfileView = computed(() => buildParentSchoolProfileView(parentAccount.value, selectedSchoolId.value))

function selectSchool(schoolId: string) {
  navigateTo({ path: APP_ROUTES.schoolProfile, query: { school: schoolId } })
}

async function handleLogout() {
  signOut()
  await navigateTo(APP_ROUTES.login)
}
</script>

<template>
  <div class="dashboard-shell">
    <AppSidebar :view-model="workspaceView" :active-route="APP_ROUTES.schoolProfile" language="en" />
    <main class="dashboard-main">
      <WorkspaceTopbar :view-model="workspaceView" eyebrow="School profile workspace" @logout="handleLogout" />
      <ParentSchoolProfileSections :view-model="schoolProfileView" @select-school="selectSchool" />
      <DeviceSection :devices="schoolProfileView.devices" @revoke="removeDevice" />
    </main>
  </div>
</template>

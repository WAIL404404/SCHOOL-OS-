import { APP_ROUTES } from '~/shared/app/data'
import { clearSession, getAccountForSession, getDefaultRouteForRole, isSessionExpired, readSession, requiresOnboarding } from '~/shared/app/session'
import { seedUsers } from '~/shared/app/data'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) {
    return
  }

  const authError = useState<string>('school-auth-error', () => '')
  const session = readSession()

  if (isSessionExpired(session)) {
    clearSession()
    authError.value = 'Your session ended automatically after inactivity. Please sign in again.'
    if (to.path !== APP_ROUTES.login) {
      return navigateTo(APP_ROUTES.login)
    }
  }

  const account = getAccountForSession(session, seedUsers)

  if (to.meta.guestOnly) {
    if (!session?.role) {
      return
    }

    return navigateTo(account && requiresOnboarding(account) ? APP_ROUTES.onboarding : getDefaultRouteForRole(session.role))
  }

  if (to.meta.onboardingOnly) {
    if (!session?.role || !account) {
      return navigateTo(APP_ROUTES.login)
    }

    if (!requiresOnboarding(account)) {
      return navigateTo(getDefaultRouteForRole(account.role))
    }

    return
  }

  if (to.meta.pageRole) {
    if (!session?.role || !account) {
      return navigateTo(APP_ROUTES.login)
    }

    if (requiresOnboarding(account)) {
      return navigateTo(APP_ROUTES.onboarding)
    }

    if (session.role !== to.meta.pageRole) {
      return navigateTo(getDefaultRouteForRole(session.role))
    }
  }
})

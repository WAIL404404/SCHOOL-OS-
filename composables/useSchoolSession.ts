import { APP_ROUTES, USER_ROLES, seedUsers } from '~/shared/app/data'
import {
  asParentAccount,
  clearSession,
  getAccountForSession,
  getBrowserStorage,
  getDefaultRouteForRole,
  isSessionExpired,
  loginUser,
  loginWithBiometric,
  loginWithInvite,
  readSession,
  recoverPassword,
  requiresOnboarding,
  revokeDevice,
  setOnboardingComplete,
  touchSessionActivity
} from '~/shared/app/session'
import type { SeedUser, SessionRecord } from '~/shared/app/types'

export function useSchoolSession() {
  const session = useState<SessionRecord | null>('school-session', () => readSession())
  const authError = useState<string>('school-auth-error', () => '')

  const account = computed<SeedUser | null>(() => getAccountForSession(session.value, seedUsers))
  const parentAccount = computed(() => asParentAccount(account.value))
  const isAuthenticated = computed(() => Boolean(session.value?.accountId))

  function syncSession() {
    const nextSession = readSession()
    if (isSessionExpired(nextSession)) {
      clearSession()
      session.value = null
      return null
    }

    session.value = nextSession
    return nextSession
  }

  function setAuthError(message = '') {
    authError.value = message
  }

  function consumeAuthError() {
    const message = authError.value
    authError.value = ''
    return message
  }

  function signOut() {
    clearSession()
    session.value = null
  }

  function signInWithCredentials(payload: { schoolCode: string; email: string; password: string }) {
    const result = loginUser(payload, getBrowserStorage())
    if (result.ok) {
      session.value = result.session
      authError.value = ''
    }
    return result
  }

  function signInWithAccessCode(payload: { schoolCode: string; accessCode: string }) {
    const result = loginUser(payload, getBrowserStorage())
    if (result.ok) {
      session.value = result.session
      authError.value = ''
    }
    return result
  }

  function signInWithQrInvite(inviteCode: string | null | undefined) {
    const result = loginWithInvite(inviteCode, getBrowserStorage())
    if (result.ok) {
      session.value = result.session
      authError.value = ''
    }
    return result
  }

  function signInWithBiometricAuth() {
    const result = loginWithBiometric(getBrowserStorage())
    if (result.ok) {
      session.value = result.session
      authError.value = ''
    }
    return result
  }

  function sendRecovery(payload: { schoolCode?: string; email?: string; channel: 'sms' | 'whatsapp' }) {
    return recoverPassword(payload, seedUsers)
  }

  function finishOnboarding() {
    if (!account.value) {
      return APP_ROUTES.login
    }

    setOnboardingComplete(account.value.id, getBrowserStorage())
    return getDefaultRouteForRole(account.value.role)
  }

  function keepAlive() {
    const updated = touchSessionActivity(getBrowserStorage())
    if (updated) {
      session.value = updated
    }
    return updated
  }

  function removeDevice(deviceId: string) {
    if (!account.value) {
      return
    }

    revokeDevice(account.value.id, deviceId, getBrowserStorage())
    syncSession()
  }

  function getHomeRoute() {
    if (!account.value) {
      return APP_ROUTES.login
    }

    return requiresOnboarding(account.value, getBrowserStorage()) ? APP_ROUTES.onboarding : getDefaultRouteForRole(account.value.role)
  }

  function roleLabel() {
    if (account.value?.role === USER_ROLES.parent) {
      return 'Parent'
    }

    return account.value?.role ?? 'guest'
  }

  return {
    session,
    account,
    parentAccount,
    isAuthenticated,
    authError,
    syncSession,
    setAuthError,
    consumeAuthError,
    signOut,
    signInWithCredentials,
    signInWithAccessCode,
    signInWithQrInvite,
    signInWithBiometricAuth,
    sendRecovery,
    finishOnboarding,
    keepAlive,
    removeDevice,
    getHomeRoute,
    roleLabel
  }
}

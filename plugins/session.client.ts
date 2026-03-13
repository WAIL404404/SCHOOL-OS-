import { APP_ROUTES, INACTIVITY_TIMEOUT_MS } from '~/shared/app/data'
import { clearSession, isSessionExpired, readSession, touchSessionActivity } from '~/shared/app/session'
import type { SessionRecord } from '~/shared/app/types'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const router = useRouter()
  const authError = useState<string>('school-auth-error', () => '')
  const sessionState = useState<SessionRecord | null>('school-session', () => readSession())

  let inactivityTimer: number | null = null

  const schedule = () => {
    const session = readSession()
    if (!session) {
      return
    }

    const elapsed = Date.now() - new Date(session.lastActiveAt).getTime()
    const remaining = Math.max(1000, INACTIVITY_TIMEOUT_MS - elapsed)
    inactivityTimer = window.setTimeout(() => {
      const latestSession = readSession()
      if (isSessionExpired(latestSession)) {
        clearSession()
        sessionState.value = null
        authError.value = 'Your session ended automatically after inactivity. Please sign in again.'
        void router.push(APP_ROUTES.login)
        return
      }

      schedule()
    }, remaining)
  }

  const handleActivity = () => {
    const updated = touchSessionActivity()
    if (updated) {
      sessionState.value = updated
    }

    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer)
    }

    schedule()
  }

  const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'mousemove', 'touchstart']
  for (const eventName of events) {
    window.addEventListener(eventName, handleActivity, { passive: true })
  }

  schedule()

  window.addEventListener('storage', () => {
    sessionState.value = readSession()
  })
})

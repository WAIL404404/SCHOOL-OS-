import { APP_ROUTES, INACTIVITY_TIMEOUT_MS, joinInvites, ROLE_DEFAULT_ROUTES, seedUsers, USER_ROLES } from './data.ts'
import type { BaseUserAccount, DeviceRecord, JoinInvite, ParentAccount, SeedUser, SessionRecord, UserRole } from './types.ts'

export const AUTH_STORAGE_KEY = 'school-os.parent-session'
export const ONBOARDING_STORAGE_KEY = 'school-os.onboarding-state'
export const DEVICE_STORAGE_KEY = 'school-os.device-registry'
export const CLIENT_DEVICE_ID_KEY = 'school-os.client-device-id'
export const LAST_ACCOUNT_ID_KEY = 'school-os.last-account-id'

function normalizeValue(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

function readJson<T>(key: string, storage: Storage | null, fallback: T): T {
  const raw = storage?.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    storage?.removeItem(key)
    return fallback
  }
}

function writeJson(key: string, value: unknown, storage: Storage | null) {
  storage?.setItem(key, JSON.stringify(value))
}

export function getBrowserStorage() {
  return import.meta.client ? window.localStorage : null
}

export function findUserAccount(credentials: { schoolCode?: string | null; email?: string | null; password?: string | null; accessCode?: string | null }, accounts: SeedUser[] = seedUsers) {
  const schoolCode = normalizeValue(credentials.schoolCode)
  const email = normalizeValue(credentials.email)
  const password = String(credentials.password ?? '')
  const accessCode = normalizeValue(credentials.accessCode)

  return accounts.find((account) => {
    const matchesCredentialBlock = normalizeValue(account.credentials.schoolCode) === schoolCode && normalizeValue(account.credentials.email) === email && account.credentials.password === password
    const matchesAccessCode = normalizeValue(account.credentials.schoolCode) === schoolCode && normalizeValue(account.credentials.accessCode) === accessCode
    return matchesCredentialBlock || matchesAccessCode
  }) ?? null
}

export function findUserById(accountId: string | null | undefined, accounts: SeedUser[] = seedUsers) {
  return accounts.find((account) => account.id === accountId) ?? null
}

export function findJoinInvite(inviteCode: string | null | undefined, invites: JoinInvite[] = joinInvites) {
  const normalized = normalizeValue(inviteCode)
  return invites.find((invite) => normalizeValue(invite.inviteCode) === normalized) ?? null
}

export function getDefaultRouteForRole(role: UserRole) {
  return ROLE_DEFAULT_ROUTES[role] ?? APP_ROUTES.login
}

export function hasCompletedOnboarding(accountId: string, storage: Storage | null = getBrowserStorage()) {
  const onboardingState = readJson<Record<string, boolean>>(ONBOARDING_STORAGE_KEY, storage, {})
  return onboardingState[accountId] === true
}

export function setOnboardingComplete(accountId: string, storage: Storage | null = getBrowserStorage()) {
  const onboardingState = readJson<Record<string, boolean>>(ONBOARDING_STORAGE_KEY, storage, {})
  onboardingState[accountId] = true
  writeJson(ONBOARDING_STORAGE_KEY, onboardingState, storage)
}

export function requiresOnboarding(account: BaseUserAccount | null, storage: Storage | null = getBrowserStorage()) {
  if (!account) return false
  return Boolean(account.needsOnboarding) && !hasCompletedOnboarding(account.id, storage)
}

export function getClientDeviceId(storage: Storage | null = getBrowserStorage()) {
  const existing = storage?.getItem(CLIENT_DEVICE_ID_KEY)
  if (existing) return existing

  const newId = `device-${Math.random().toString(36).slice(2, 10)}`
  storage?.setItem(CLIENT_DEVICE_ID_KEY, newId)
  return newId
}

function getBrowserLabel(envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined) {
  const userAgent = String(envNavigator?.userAgent ?? 'Workspace Browser')
  if (userAgent.includes('Windows')) return 'Windows Browser'
  if (userAgent.includes('iPhone')) return 'iPhone'
  if (userAgent.includes('iPad')) return 'iPad'
  if (userAgent.includes('Android')) return 'Android Device'
  return 'Trusted Browser'
}

export function registerDeviceForAccount(account: BaseUserAccount, storage: Storage | null = getBrowserStorage(), envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined) {
  const deviceRegistry = readJson<Record<string, DeviceRecord[]>>(DEVICE_STORAGE_KEY, storage, {})
  const accountDevices = deviceRegistry[account.id] ?? []
  const currentDeviceId = getClientDeviceId(storage)
  const now = new Date().toISOString()
  const nextDevice: DeviceRecord & { current: true } = {
    id: currentDeviceId,
    name: getBrowserLabel(envNavigator),
    location: 'Current browser session',
    lastActiveAt: now,
    trusted: true,
    current: true
  }

  deviceRegistry[account.id] = [...accountDevices.filter((item) => item.id !== currentDeviceId), nextDevice]
  writeJson(DEVICE_STORAGE_KEY, deviceRegistry, storage)
  storage?.setItem(LAST_ACCOUNT_ID_KEY, account.id)
  return nextDevice
}

export function listDevicesForAccount(account: BaseUserAccount, storage: Storage | null = getBrowserStorage()) {
  const currentDeviceId = getClientDeviceId(storage)
  const runtimeDevices = readJson<Record<string, DeviceRecord[]>>(DEVICE_STORAGE_KEY, storage, {})[account.id] ?? []
  const merged = [...(account.knownDevices ?? []), ...runtimeDevices].reduce<Record<string, DeviceRecord>>((accumulator, item) => {
    accumulator[item.id] = { ...accumulator[item.id], ...item }
    return accumulator
  }, {})

  return Object.values(merged)
    .map((item) => ({ ...item, current: item.id === currentDeviceId }))
    .sort((left, right) => String(right.lastActiveAt).localeCompare(String(left.lastActiveAt)))
}

export function revokeDevice(accountId: string, deviceId: string, storage: Storage | null = getBrowserStorage()) {
  const registry = readJson<Record<string, DeviceRecord[]>>(DEVICE_STORAGE_KEY, storage, {})
  registry[accountId] = (registry[accountId] ?? []).filter((item) => item.id !== deviceId)
  writeJson(DEVICE_STORAGE_KEY, registry, storage)
}

export function createSessionFromAccount(account: BaseUserAccount, storage: Storage | null = getBrowserStorage(), envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined): SessionRecord {
  const currentDevice = registerDeviceForAccount(account, storage, envNavigator)
  const now = new Date().toISOString()
  return { accountId: account.id, role: account.role, schoolId: account.school.id, schoolName: account.school.name, displayName: account.profile.displayName, deviceId: currentDevice.id, signedInAt: now, lastActiveAt: now }
}

export function loginUser(credentials: { schoolCode?: string | null; email?: string | null; password?: string | null; accessCode?: string | null }, storage: Storage | null = getBrowserStorage(), accounts: SeedUser[] = seedUsers, envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined) {
  const account = findUserAccount(credentials, accounts)
  if (!account) {
    return { ok: false as const, error: "We couldn't match that account. Please recheck the school code, email, password, or unique code." }
  }

  const session = createSessionFromAccount(account, storage, envNavigator)
  storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  return { ok: true as const, session, account, redirectTo: requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(account.role) }
}

export function loginWithInvite(inviteCode: string | null | undefined, storage: Storage | null = getBrowserStorage(), accounts: SeedUser[] = seedUsers, envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined) {
  const invite = findJoinInvite(inviteCode)
  if (!invite) return { ok: false as const, error: 'Invite not found' }

  const account = findUserById(invite.accountId, accounts)
  if (!account) return { ok: false as const, error: 'Linked account not found' }

  return loginUser({ schoolCode: account.credentials.schoolCode, accessCode: account.credentials.accessCode }, storage, accounts, envNavigator)
}

export function loginWithBiometric(storage: Storage | null = getBrowserStorage(), accounts: SeedUser[] = seedUsers, envNavigator: Navigator | undefined = import.meta.client ? window.navigator : undefined) {
  const lastAccountId = storage?.getItem(LAST_ACCOUNT_ID_KEY)
  const account = findUserById(lastAccountId, accounts)
  if (!account || !account.biometricEnabled) {
    return { ok: false as const, error: 'Biometric sign-in is not ready on this device yet. Sign in once with your regular credentials first.' }
  }

  return loginUser({ schoolCode: account.credentials.schoolCode, accessCode: account.credentials.accessCode }, storage, accounts, envNavigator)
}

export function recoverPassword(payload: { schoolCode?: string | null; email?: string | null; channel?: 'sms' | 'whatsapp' | null }, accounts: SeedUser[] = seedUsers) {
  const account = accounts.find((item) => normalizeValue(item.credentials.schoolCode) === normalizeValue(payload.schoolCode) && normalizeValue(item.credentials.email) === normalizeValue(payload.email))
  if (!account) return { ok: false as const, message: 'We could not find an account for that school code and email.' }

  const destination = payload.channel ? account.recovery?.[payload.channel] : null
  if (!destination) return { ok: false as const, message: 'That recovery channel is not configured for this account.' }

  return { ok: true as const, message: `A secure recovery link was sent by ${payload.channel === 'sms' ? 'SMS' : 'WhatsApp'} to ${destination}.` }
}

export function readSession(storage: Storage | null = getBrowserStorage()): SessionRecord | null {
  const raw = storage?.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SessionRecord
  } catch {
    storage?.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function writeSession(session: SessionRecord, storage: Storage | null = getBrowserStorage()) {
  storage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function touchSessionActivity(storage: Storage | null = getBrowserStorage()) {
  const session = readSession(storage)
  if (!session) return null
  const updated = { ...session, lastActiveAt: new Date().toISOString() }
  writeSession(updated, storage)
  return updated
}

export function isSessionExpired(session: SessionRecord | null, now = Date.now(), timeoutMs = INACTIVITY_TIMEOUT_MS) {
  if (!session?.lastActiveAt) return false
  return now - new Date(session.lastActiveAt).getTime() > timeoutMs
}

export function clearSession(storage: Storage | null = getBrowserStorage()) {
  storage?.removeItem(AUTH_STORAGE_KEY)
}

export function getAccountForSession(session: SessionRecord | null, accounts: SeedUser[] = seedUsers) {
  if (!session?.accountId) return null
  return accounts.find((account) => account.id === session.accountId) ?? null
}

export function getRoleForRoute(targetRoute: string) {
  if (targetRoute.startsWith('/super-admin/')) return USER_ROLES.superAdmin
  if (targetRoute.startsWith('/school-admin/')) return USER_ROLES.schoolAdmin
  if (targetRoute.startsWith('/teacher/')) return USER_ROLES.teacher
  if (targetRoute.startsWith('/parent/')) return USER_ROLES.parent
  if (targetRoute.startsWith('/transport-driver/')) return USER_ROLES.transportDriver
  if (targetRoute.startsWith('/supervisor/')) return USER_ROLES.supervisor
  return null
}

export function canAccessRoute(session: SessionRecord | null, targetRoute: string) {
  const expectedRole = getRoleForRoute(targetRoute)
  if (!expectedRole) {
    const publicRoutes: string[] = [APP_ROUTES.login, APP_ROUTES.join, APP_ROUTES.onboarding]
    return publicRoutes.includes(targetRoute)
  }

  return session?.role === expectedRole && Boolean(session?.accountId)
}

export function resolveRoute(targetRoute: string, session: SessionRecord | null, storage: Storage | null = getBrowserStorage(), accounts: SeedUser[] = seedUsers) {
  const path = targetRoute || APP_ROUTES.login
  if (path === APP_ROUTES.login && session?.role) {
    const account = getAccountForSession(session, accounts)
    return account && requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(session.role)
  }

  if (path === APP_ROUTES.onboarding) return session?.role ? APP_ROUTES.onboarding : APP_ROUTES.login
  if (path === APP_ROUTES.join) return APP_ROUTES.join

  const expectedRole = getRoleForRoute(path)
  if (expectedRole && !canAccessRoute(session, path)) {
    if (!session?.role) return APP_ROUTES.login
    const account = getAccountForSession(session, accounts)
    return account && requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(session.role)
  }

  return targetRoute || APP_ROUTES.login
}

export function asParentAccount(account: SeedUser | null) {
  return account?.role === USER_ROLES.parent ? account as ParentAccount : null
}



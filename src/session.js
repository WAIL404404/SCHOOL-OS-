import {
  APP_ROUTES,
  INACTIVITY_TIMEOUT_MS,
  joinInvites,
  ROLE_DEFAULT_ROUTES,
  seedUsers,
  USER_ROLES
} from "./data.js";

export const AUTH_STORAGE_KEY = "school-os.parent-session";
export const ONBOARDING_STORAGE_KEY = "school-os.onboarding-state";
export const DEVICE_STORAGE_KEY = "school-os.device-registry";
export const CLIENT_DEVICE_ID_KEY = "school-os.client-device-id";
export const LAST_ACCOUNT_ID_KEY = "school-os.last-account-id";

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function readJson(key, storage = globalThis.localStorage, fallback = {}) {
  const raw = storage?.getItem?.(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    storage?.removeItem?.(key);
    return fallback;
  }
}

function writeJson(key, value, storage = globalThis.localStorage) {
  storage?.setItem?.(key, JSON.stringify(value));
}

export function findUserAccount(credentials, accounts = seedUsers) {
  const schoolCode = normalizeValue(credentials.schoolCode);
  const email = normalizeValue(credentials.email);
  const password = String(credentials.password ?? "");
  const accessCode = normalizeValue(credentials.accessCode);

  return (
    accounts.find((account) => {
      const matchesCredentialBlock =
        normalizeValue(account.credentials.schoolCode) === schoolCode &&
        normalizeValue(account.credentials.email) === email &&
        account.credentials.password === password;

      const matchesAccessCode =
        normalizeValue(account.credentials.schoolCode) === schoolCode &&
        normalizeValue(account.credentials.accessCode) === accessCode;

      return matchesCredentialBlock || matchesAccessCode;
    }) ?? null
  );
}

export function findUserById(accountId, accounts = seedUsers) {
  return accounts.find((account) => account.id === accountId) ?? null;
}

export function findJoinInvite(inviteCode, invites = joinInvites) {
  const normalized = normalizeValue(inviteCode);
  return invites.find((invite) => normalizeValue(invite.inviteCode) === normalized) ?? null;
}

export function getDefaultRouteForRole(role) {
  return ROLE_DEFAULT_ROUTES[role] ?? APP_ROUTES.login;
}

export function hasCompletedOnboarding(accountId, storage = globalThis.localStorage) {
  const onboardingState = readJson(ONBOARDING_STORAGE_KEY, storage, {});
  return onboardingState[accountId] === true;
}

export function setOnboardingComplete(accountId, storage = globalThis.localStorage) {
  const onboardingState = readJson(ONBOARDING_STORAGE_KEY, storage, {});
  onboardingState[accountId] = true;
  writeJson(ONBOARDING_STORAGE_KEY, onboardingState, storage);
}

export function requiresOnboarding(account, storage = globalThis.localStorage) {
  return Boolean(account?.needsOnboarding) && !hasCompletedOnboarding(account.id, storage);
}

export function getClientDeviceId(storage = globalThis.localStorage) {
  const existing = storage?.getItem?.(CLIENT_DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const newId = `device-${Math.random().toString(36).slice(2, 10)}`;
  storage?.setItem?.(CLIENT_DEVICE_ID_KEY, newId);
  return newId;
}

function getBrowserLabel(envNavigator = globalThis.navigator) {
  const userAgent = String(envNavigator?.userAgent ?? "Workspace Browser");
  if (userAgent.includes("Windows")) {
    return "Windows Browser";
  }
  if (userAgent.includes("iPhone")) {
    return "iPhone";
  }
  if (userAgent.includes("iPad")) {
    return "iPad";
  }
  if (userAgent.includes("Android")) {
    return "Android Device";
  }

  return "Trusted Browser";
}

export function registerDeviceForAccount(account, storage = globalThis.localStorage, envNavigator = globalThis.navigator) {
  const deviceRegistry = readJson(DEVICE_STORAGE_KEY, storage, {});
  const accountDevices = deviceRegistry[account.id] ?? [];
  const currentDeviceId = getClientDeviceId(storage);
  const now = new Date().toISOString();
  const nextDevice = {
    id: currentDeviceId,
    name: getBrowserLabel(envNavigator),
    location: "Current browser session",
    lastActiveAt: now,
    trusted: true,
    current: true
  };

  const updated = [...accountDevices.filter((item) => item.id !== currentDeviceId), nextDevice];
  deviceRegistry[account.id] = updated;
  writeJson(DEVICE_STORAGE_KEY, deviceRegistry, storage);
  storage?.setItem?.(LAST_ACCOUNT_ID_KEY, account.id);

  return nextDevice;
}

export function listDevicesForAccount(account, storage = globalThis.localStorage) {
  const currentDeviceId = getClientDeviceId(storage);
  const runtimeDevices = readJson(DEVICE_STORAGE_KEY, storage, {})[account.id] ?? [];
  const merged = [...(account.knownDevices ?? []), ...runtimeDevices].reduce((accumulator, item) => {
    accumulator[item.id] = { ...accumulator[item.id], ...item };
    return accumulator;
  }, {});

  return Object.values(merged)
    .map((item) => ({ ...item, current: item.id === currentDeviceId }))
    .sort((left, right) => String(right.lastActiveAt).localeCompare(String(left.lastActiveAt)));
}

export function revokeDevice(accountId, deviceId, storage = globalThis.localStorage) {
  const registry = readJson(DEVICE_STORAGE_KEY, storage, {});
  registry[accountId] = (registry[accountId] ?? []).filter((item) => item.id !== deviceId);
  writeJson(DEVICE_STORAGE_KEY, registry, storage);
}

export function createSessionFromAccount(account, storage = globalThis.localStorage, envNavigator = globalThis.navigator) {
  const currentDevice = registerDeviceForAccount(account, storage, envNavigator);
  const now = new Date().toISOString();

  return {
    accountId: account.id,
    role: account.role,
    schoolId: account.school.id,
    schoolName: account.school.name,
    displayName: account.profile.displayName,
    deviceId: currentDevice.id,
    signedInAt: now,
    lastActiveAt: now
  };
}

export function loginUser(credentials, storage = globalThis.localStorage, accounts = seedUsers, envNavigator = globalThis.navigator) {
  const account = findUserAccount(credentials, accounts);
  if (!account) {
    return {
      ok: false,
      error: "We couldn't match that account. Please recheck the school code, email, password, or unique code."
    };
  }

  const session = createSessionFromAccount(account, storage, envNavigator);
  storage?.setItem?.(AUTH_STORAGE_KEY, JSON.stringify(session));
  return {
    ok: true,
    session,
    account,
    redirectTo: requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(account.role)
  };
}

export function loginWithInvite(inviteCode, storage = globalThis.localStorage, accounts = seedUsers, envNavigator = globalThis.navigator) {
  const invite = findJoinInvite(inviteCode);
  if (!invite) {
    return { ok: false, error: "Invite not found" };
  }

  const account = findUserById(invite.accountId, accounts);
  if (!account) {
    return { ok: false, error: "Linked account not found" };
  }

  return loginUser(
    {
      schoolCode: account.credentials.schoolCode,
      accessCode: account.credentials.accessCode
    },
    storage,
    accounts,
    envNavigator
  );
}

export function loginWithBiometric(storage = globalThis.localStorage, accounts = seedUsers, envNavigator = globalThis.navigator) {
  const lastAccountId = storage?.getItem?.(LAST_ACCOUNT_ID_KEY);
  const account = findUserById(lastAccountId, accounts);
  if (!account || !account.biometricEnabled) {
    return {
      ok: false,
      error: "Biometric sign-in is not ready on this device yet. Sign in once with your regular credentials first."
    };
  }

  return loginUser(
    {
      schoolCode: account.credentials.schoolCode,
      accessCode: account.credentials.accessCode
    },
    storage,
    accounts,
    envNavigator
  );
}

export function recoverPassword({ schoolCode, email, channel }, accounts = seedUsers) {
  const account = accounts.find((item) => {
    return (
      normalizeValue(item.credentials.schoolCode) === normalizeValue(schoolCode) &&
      normalizeValue(item.credentials.email) === normalizeValue(email)
    );
  });

  if (!account) {
    return {
      ok: false,
      message: "We could not find an account for that school code and email."
    };
  }

  const destination = account.recovery?.[channel];
  if (!destination) {
    return {
      ok: false,
      message: "That recovery channel is not configured for this account."
    };
  }

  return {
    ok: true,
    message: `A secure recovery link was sent by ${channel === "sms" ? "SMS" : "WhatsApp"} to ${destination}.`
  };
}

export function readSession(storage = globalThis.localStorage) {
  const raw = storage?.getItem?.(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    storage?.removeItem?.(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeSession(session, storage = globalThis.localStorage) {
  storage?.setItem?.(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function touchSessionActivity(storage = globalThis.localStorage) {
  const session = readSession(storage);
  if (!session) {
    return null;
  }

  const updated = {
    ...session,
    lastActiveAt: new Date().toISOString()
  };
  writeSession(updated, storage);
  return updated;
}

export function isSessionExpired(session, now = Date.now(), timeoutMs = INACTIVITY_TIMEOUT_MS) {
  if (!session?.lastActiveAt) {
    return false;
  }

  return now - new Date(session.lastActiveAt).getTime() > timeoutMs;
}

export function clearSession(storage = globalThis.localStorage) {
  storage?.removeItem?.(AUTH_STORAGE_KEY);
}

export function getAccountForSession(session, accounts = seedUsers) {
  if (!session?.accountId) {
    return null;
  }

  return accounts.find((account) => account.id === session.accountId) ?? null;
}

export function getRoleForRoute(targetRoute) {
  const route = String(targetRoute ?? "").split("?")[0];

  if (route.startsWith("#/super-admin/")) {
    return USER_ROLES.superAdmin;
  }
  if (route.startsWith("#/school-admin/")) {
    return USER_ROLES.schoolAdmin;
  }
  if (route.startsWith("#/teacher/")) {
    return USER_ROLES.teacher;
  }
  if (route.startsWith("#/parent/")) {
    return USER_ROLES.parent;
  }
  if (route.startsWith("#/transport-driver/")) {
    return USER_ROLES.transportDriver;
  }
  if (route.startsWith("#/supervisor/")) {
    return USER_ROLES.supervisor;
  }

  return null;
}

export function canAccessRoute(session, targetRoute) {
  const expectedRole = getRoleForRoute(targetRoute);
  if (!expectedRole) {
    return [APP_ROUTES.login, APP_ROUTES.join, APP_ROUTES.onboarding].includes(String(targetRoute ?? "").split("?")[0]);
  }

  return session?.role === expectedRole && Boolean(session?.accountId);
}

export function resolveRoute(targetRoute, session, storage = globalThis.localStorage, accounts = seedUsers) {
  const path = String(targetRoute ?? APP_ROUTES.login).split("?")[0];

  if (path === APP_ROUTES.login && session?.role) {
    const account = getAccountForSession(session, accounts);
    return account && requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(session.role);
  }

  if (path === APP_ROUTES.onboarding) {
    return session?.role ? APP_ROUTES.onboarding : APP_ROUTES.login;
  }

  if (path === APP_ROUTES.join) {
    return APP_ROUTES.join;
  }

  const expectedRole = getRoleForRoute(path);
  if (expectedRole && !canAccessRoute(session, path)) {
    if (!session?.role) {
      return APP_ROUTES.login;
    }

    const account = getAccountForSession(session, accounts);
    return account && requiresOnboarding(account, storage) ? APP_ROUTES.onboarding : getDefaultRouteForRole(session.role);
  }

  return targetRoute || APP_ROUTES.login;
}

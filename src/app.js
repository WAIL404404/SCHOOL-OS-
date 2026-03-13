import { APP_ROUTES, demoLoginOptions, INACTIVITY_TIMEOUT_MS, joinInvites, seedUsers, USER_ROLES } from "./data.js";
import { getLanguage, getLanguageMeta, setLanguage, t } from "./i18n.js";
import {
  clearSession,
  findJoinInvite,
  findUserById,
  getAccountForSession,
  getDefaultRouteForRole,
  isSessionExpired,
  LAST_ACCOUNT_ID_KEY,
  loginUser,
  loginWithBiometric,
  loginWithInvite,
  readSession,
  recoverPassword,
  requiresOnboarding,
  resolveRoute,
  revokeDevice,
  setOnboardingComplete,
  touchSessionActivity
} from "./session.js";
import {
  renderJoinTemplate,
  renderLoginTemplate,
  renderOnboardingTemplate,
  renderParentDashboardTemplate,
  renderRoleWorkspaceTemplate
} from "./templates.js";
import { buildParentDashboardView, buildRoleWorkspaceView } from "./view-models.js";

const appRoot = document.querySelector("#app");

const authUiState = {
  authMode: "credentials",
  errorMessage: "",
  recoveryMessage: "",
  biometricMessage: "",
  showRecovery: false,
  onboardingStep: 0,
  pendingPrefill: null
};

let cleanupActivityMonitor = null;
let inactivityTimer = null;

function getRouteState() {
  const fullHash = window.location.hash || APP_ROUTES.login;
  const [path, queryString = ""] = fullHash.split("?");
  return {
    fullHash,
    path,
    query: new URLSearchParams(queryString)
  };
}

function syncDocumentLanguage(language) {
  const meta = getLanguageMeta(language);
  document.documentElement.lang = language;
  document.documentElement.dir = meta.dir;
}

function navigate(route) {
  if (window.location.hash === route) {
    renderApp();
    return;
  }

  window.location.hash = route;
}

function buildParentRoute(childId) {
  return childId ? `${APP_ROUTES.parentDashboard}?child=${encodeURIComponent(childId)}` : APP_ROUTES.parentDashboard;
}

function resetAuthMessages() {
  authUiState.errorMessage = "";
  authUiState.recoveryMessage = "";
  authUiState.biometricMessage = "";
}

function getBiometricReadyAccount() {
  const lastAccountId = window.localStorage.getItem(LAST_ACCOUNT_ID_KEY);
  const account = findUserById(lastAccountId, seedUsers);
  return account?.biometricEnabled ? account : null;
}

function populatePendingPrefill(form) {
  if (!form || !authUiState.pendingPrefill) {
    return;
  }

  const option = authUiState.pendingPrefill;
  if (authUiState.authMode === "access-code") {
    form.elements.schoolCode.value = option.schoolCode;
    form.elements.accessCode.value = option.accessCode;
  } else if (authUiState.authMode === "credentials") {
    form.elements.schoolCode.value = option.schoolCode;
    form.elements.email.value = option.email;
    form.elements.password.value = option.password;
  }

  authUiState.pendingPrefill = null;
}

function attachLanguageButtons() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.getAttribute("data-language"));
      renderApp();
    });
  });
}

function renderLogin() {
  stopInactivityMonitor();
  const language = getLanguage();
  syncDocumentLanguage(language);

  appRoot.innerHTML = renderLoginTemplate({
    language,
    authMode: authUiState.authMode,
    errorMessage: authUiState.errorMessage,
    recoveryMessage: authUiState.recoveryMessage,
    biometricMessage: authUiState.biometricMessage,
    demoOptions: demoLoginOptions,
    invites: joinInvites,
    biometricReady: Boolean(getBiometricReadyAccount()),
    showRecovery: authUiState.showRecovery
  });

  attachLanguageButtons();
  attachLoginInteractions();
}

function attachLoginInteractions() {
  const form = document.querySelector("#login-form");
  populatePendingPrefill(form);

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      authUiState.authMode = button.getAttribute("data-auth-mode");
      authUiState.showRecovery = false;
      resetAuthMessages();
      renderLogin();
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const result = loginUser({
      schoolCode: formData.get("schoolCode"),
      email: formData.get("email"),
      password: formData.get("password"),
      accessCode: formData.get("accessCode")
    });

    if (!result.ok) {
      authUiState.errorMessage = result.error;
      renderLogin();
      return;
    }

    resetAuthMessages();
    navigate(result.redirectTo);
  });

  document.querySelectorAll("[data-demo-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const option = demoLoginOptions[Number(button.getAttribute("data-demo-index"))];
      if (!option) {
        return;
      }

      if (authUiState.authMode === "qr") {
        authUiState.authMode = "credentials";
      }
      authUiState.pendingPrefill = option;
      resetAuthMessages();
      renderLogin();
    });
  });

  document.querySelectorAll("[data-open-invite]").forEach((button) => {
    button.addEventListener("click", () => {
      const inviteCode = button.getAttribute("data-open-invite");
      navigate(`${APP_ROUTES.join}?invite=${encodeURIComponent(inviteCode)}`);
    });
  });

  document.querySelector("[data-toggle-recovery]")?.addEventListener("click", () => {
    authUiState.showRecovery = !authUiState.showRecovery;
    authUiState.recoveryMessage = "";
    renderLogin();
  });

  document.querySelectorAll("[data-recovery-channel]").forEach((button) => {
    button.addEventListener("click", () => {
      const channel = button.getAttribute("data-recovery-channel");
      const schoolCode = form?.elements.schoolCode?.value ?? "";
      const email = form?.elements.email?.value ?? authUiState.pendingPrefill?.email ?? "";
      const result = recoverPassword({ schoolCode, email, channel });
      authUiState.recoveryMessage = result.message;
      renderLogin();
    });
  });

  document.querySelector("[data-biometric-login]")?.addEventListener("click", () => {
    const result = loginWithBiometric();
    if (!result.ok) {
      authUiState.biometricMessage = result.error;
      renderLogin();
      return;
    }

    resetAuthMessages();
    navigate(result.redirectTo);
  });
}

function renderJoin() {
  stopInactivityMonitor();
  const language = getLanguage();
  syncDocumentLanguage(language);
  const routeState = getRouteState();
  const invite = findJoinInvite(routeState.query.get("invite"));
  appRoot.innerHTML = renderJoinTemplate({ language, invite });
  attachLanguageButtons();

  document.querySelector("[data-accept-invite]")?.addEventListener("click", () => {
    const result = loginWithInvite(invite.inviteCode);
    if (!result.ok) {
      authUiState.errorMessage = result.error;
      navigate(APP_ROUTES.login);
      return;
    }

    navigate(result.redirectTo);
  });
}

function renderOnboarding() {
  const language = getLanguage();
  syncDocumentLanguage(language);
  const session = readSession();
  const account = getAccountForSession(session);
  if (!account) {
    clearSession();
    renderLogin();
    return;
  }

  stopInactivityMonitor();
  const slides = t(language, "onboarding.slides");
  const stepIndex = Math.min(authUiState.onboardingStep, slides.length - 1);
  const slide = slides[stepIndex];
  appRoot.innerHTML = renderOnboardingTemplate({
    language,
    stepIndex,
    totalSlides: slides.length,
    slide,
    displayName: account.profile.displayName
  });
  attachLanguageButtons();

  document.querySelectorAll("[data-onboarding-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-onboarding-action");
      if (action === "back") {
        authUiState.onboardingStep = Math.max(0, authUiState.onboardingStep - 1);
        renderOnboarding();
        return;
      }

      if (action === "skip" || stepIndex === slides.length - 1) {
        setOnboardingComplete(account.id);
        authUiState.onboardingStep = 0;
        navigate(getDefaultRouteForRole(account.role));
        return;
      }

      authUiState.onboardingStep = Math.min(slides.length - 1, authUiState.onboardingStep + 1);
      renderOnboarding();
    });
  });
}

function stopInactivityMonitor() {
  if (cleanupActivityMonitor) {
    cleanupActivityMonitor();
    cleanupActivityMonitor = null;
  }
  if (inactivityTimer) {
    window.clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

function startInactivityMonitor() {
  stopInactivityMonitor();

  const schedule = () => {
    const session = readSession();
    if (!session) {
      return;
    }

    const elapsed = Date.now() - new Date(session.lastActiveAt).getTime();
    const remaining = Math.max(1000, INACTIVITY_TIMEOUT_MS - elapsed);
    inactivityTimer = window.setTimeout(() => {
      const latestSession = readSession();
      if (isSessionExpired(latestSession)) {
        clearSession();
        authUiState.errorMessage = "Your session ended automatically after inactivity. Please sign in again.";
        navigate(APP_ROUTES.login);
        return;
      }

      schedule();
    }, remaining);
  };

  const handleActivity = () => {
    touchSessionActivity();
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer);
    }
    schedule();
  };

  const events = ["click", "keydown", "mousemove", "touchstart"];
  events.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
  schedule();

  cleanupActivityMonitor = () => {
    events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
  };
}

function attachWorkspaceInteractions(account) {
  document.querySelector("#logout-button")?.addEventListener("click", () => {
    clearSession();
    navigate(APP_ROUTES.login);
  });

  document.querySelectorAll("[data-revoke-device]").forEach((button) => {
    button.addEventListener("click", () => {
      revokeDevice(account.id, button.getAttribute("data-revoke-device"));
      renderAuthenticatedRoute(getRouteState().fullHash);
    });
  });

  document.querySelectorAll("[data-select-child]").forEach((button) => {
    button.addEventListener("click", () => {
      navigate(buildParentRoute(button.getAttribute("data-select-child")));
    });
  });
}

function renderAuthenticatedRoute(route) {
  const language = getLanguage();
  syncDocumentLanguage(language);

  const [path, queryString = ""] = String(route ?? APP_ROUTES.parentDashboard).split("?");
  const query = new URLSearchParams(queryString);

  const session = readSession();
  if (isSessionExpired(session)) {
    clearSession();
    authUiState.errorMessage = "Your session ended automatically after inactivity. Please sign in again.";
    renderLogin();
    return;
  }

  const account = getAccountForSession(session);
  if (!account) {
    clearSession();
    authUiState.errorMessage = "Your session expired. Please sign in again with the account provided to you.";
    renderLogin();
    return;
  }

  if (requiresOnboarding(account) && path !== APP_ROUTES.onboarding) {
    navigate(APP_ROUTES.onboarding);
    return;
  }

  if (account.role === USER_ROLES.parent) {
    const viewModel = { ...buildParentDashboardView(account, query.get("child")), role: account.role };
    appRoot.innerHTML = renderParentDashboardTemplate(viewModel, path, language);
  } else {
    const viewModel = { ...buildRoleWorkspaceView(account), role: account.role };
    appRoot.innerHTML = renderRoleWorkspaceTemplate(viewModel, path, language);
  }

  attachWorkspaceInteractions(account);
  startInactivityMonitor();
}

function renderApp() {
  const routeState = getRouteState();
  const session = readSession();
  const resolvedRoute = resolveRoute(routeState.fullHash, session);
  if (resolvedRoute !== routeState.fullHash) {
    navigate(resolvedRoute);
    return;
  }

  if (routeState.path === APP_ROUTES.login) {
    renderLogin();
    return;
  }

  if (routeState.path === APP_ROUTES.join) {
    renderJoin();
    return;
  }

  if (routeState.path === APP_ROUTES.onboarding) {
    renderOnboarding();
    return;
  }

  renderAuthenticatedRoute(routeState.fullHash);
}

window.addEventListener("hashchange", renderApp);
window.addEventListener("DOMContentLoaded", renderApp);

renderApp();

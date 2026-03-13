import { APP_NAME, APP_ROUTES, navigationByRole } from "./data.js";
import { getLanguageMeta, SUPPORTED_LANGUAGES, t } from "./i18n.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLanguageSelector(language) {
  return `
    <div class="language-switcher" aria-label="Language selector">
      <span class="language-switcher__label">${escapeHtml(t(language, "auth.language"))}</span>
      <div class="language-switcher__buttons">
        ${SUPPORTED_LANGUAGES.map((item) => {
          const isActive = item.code === language;
          return `<button class="language-chip${isActive ? " language-chip--active" : ""}" type="button" data-language="${item.code}">${escapeHtml(item.nativeLabel)}</button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderAuthTabs(language, activeMode) {
  const tabs = [
    { id: "credentials", label: t(language, "auth.codeTab") },
    { id: "access-code", label: t(language, "auth.accessCodeTab") },
    { id: "qr", label: t(language, "auth.qrTab") }
  ];

  return `
    <div class="auth-tabs" role="tablist">
      ${tabs
        .map(
          (tab) => `
            <button
              class="auth-tab${tab.id === activeMode ? " auth-tab--active" : ""}"
              type="button"
              data-auth-mode="${tab.id}"
            >
              ${escapeHtml(tab.label)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderDemoCards(options) {
  return options
    .map(
      (option, index) => `
        <button class="demo-card" type="button" data-demo-index="${index}">
          <span class="demo-card__title">${escapeHtml(option.label)}</span>
          <span class="demo-card__badge">${escapeHtml(option.roleLabel)}</span>
          <span class="demo-card__body">${escapeHtml(option.summary)}</span>
          <span class="demo-card__meta">${escapeHtml(option.schoolCode)} · ${escapeHtml(option.email)}</span>
        </button>
      `
    )
    .join("");
}

function renderQrCards(language, invites) {
  return invites
    .map(
      (invite) => `
        <article class="qr-card">
          <div class="qr-card__visual" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="eyebrow">${escapeHtml(invite.schoolName)}</p>
          <h3>${escapeHtml(invite.title)}</h3>
          <p>${escapeHtml(invite.linkedChildren.join(", "))}</p>
          <button class="button button--secondary" type="button" data-open-invite="${invite.inviteCode}">${escapeHtml(t(language, "auth.join"))}</button>
        </article>
      `
    )
    .join("");
}

function renderRecoveryPanel(language, recoveryMessage = "") {
  return `
    <div class="recovery-panel">
      <div>
        <h3>${escapeHtml(t(language, "auth.recoveryTitle"))}</h3>
        <p>${escapeHtml(t(language, "auth.recoveryBody"))}</p>
      </div>
      <div class="recovery-panel__actions">
        <button class="button button--secondary" type="button" data-recovery-channel="sms">${escapeHtml(t(language, "auth.sms"))}</button>
        <button class="button button--secondary" type="button" data-recovery-channel="whatsapp">${escapeHtml(t(language, "auth.whatsapp"))}</button>
      </div>
      ${recoveryMessage ? `<p class="form-message">${escapeHtml(recoveryMessage)}</p>` : ""}
    </div>
  `;
}

function renderCredentialsFields(language) {
  return `
    <label>
      <span>${escapeHtml(t(language, "auth.schoolCode"))}</span>
      <input name="schoolCode" type="text" placeholder="SUMMIT or PLATFORM" autocomplete="organization" required />
    </label>
    <label>
      <span>${escapeHtml(t(language, "auth.email"))}</span>
      <input name="email" type="email" placeholder="user@school.test" autocomplete="username" required />
    </label>
    <label>
      <span>${escapeHtml(t(language, "auth.password"))}</span>
      <input name="password" type="password" placeholder="Enter password" autocomplete="current-password" required />
    </label>
  `;
}

function renderAccessCodeFields(language) {
  return `
    <label>
      <span>${escapeHtml(t(language, "auth.schoolCode"))}</span>
      <input name="schoolCode" type="text" placeholder="SUMMIT" autocomplete="organization" required />
    </label>
    <label>
      <span>${escapeHtml(t(language, "auth.accessCode"))}</span>
      <input name="accessCode" type="text" placeholder="SUMMIT-FAMILY-1101" autocomplete="one-time-code" required />
    </label>
  `;
}

function renderNavigation(role, activeRoute) {
  return (navigationByRole[role] ?? [])
    .map((item) => {
      const activeClass = item.route === activeRoute ? "nav-link nav-link--active" : "nav-link";
      return `
        <a class="${activeClass}" href="${item.route}">
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(item.description)}</small>
        </a>
      `;
    })
    .join("");
}

function renderSidebar(viewModel, activeRoute, language) {
  return `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <p class="eyebrow">${escapeHtml(APP_NAME)}</p>
        <h1>${escapeHtml(viewModel.school.name)}</h1>
        <p>${escapeHtml(viewModel.school.campus)}</p>
        <span class="role-chip">${escapeHtml(viewModel.roleLabel)}</span>
      </div>
      <nav class="sidebar__nav" aria-label="Role navigation">
        ${renderNavigation(viewModel.role, activeRoute)}
      </nav>
      <div class="sidebar__footer">
        <p>${escapeHtml(t(language, "common.support"))}</p>
        <a href="mailto:${escapeHtml(viewModel.school.supportEmail)}">${escapeHtml(viewModel.school.supportEmail)}</a>
      </div>
    </aside>
  `;
}

function renderWorkspaceTopbar(viewModel, ctaLabel, language) {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${escapeHtml(ctaLabel)}</p>
        <h2>Welcome back, ${escapeHtml(viewModel.displayName)}</h2>
        <p>${escapeHtml(viewModel.school.greeting ?? viewModel.description)}</p>
      </div>
      <div class="topbar__actions">
        <span class="role-chip role-chip--light">${escapeHtml(viewModel.roleLabel)}</span>
        <button id="logout-button" class="button button--ghost" type="button">${escapeHtml(t(language, "common.signOut"))}</button>
      </div>
    </header>
  `;
}

function renderDeviceSection(viewModel, language) {
  return `
    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">${escapeHtml(t(language, "common.devicesTitle"))}</p>
        <h2>${escapeHtml(t(language, "common.devicesTitle"))}</h2>
        <p>${escapeHtml(t(language, "common.devicesBody"))}</p>
        <small class="auth-note">${escapeHtml(t(language, "common.inactivityNote"))}</small>
      </div>
      <div class="device-grid">
        ${viewModel.devices
          .map(
            (device) => `
              <article class="device-card">
                <div class="device-card__top">
                  <div>
                    <h3>${escapeHtml(device.name)}</h3>
                    <p>${escapeHtml(device.location)}</p>
                  </div>
                  <span class="status-pill${device.current ? "" : " status-pill--neutral"}">${escapeHtml(device.current ? t(language, "common.currentDevice") : t(language, "common.trusted"))}</span>
                </div>
                <p>${escapeHtml(t(language, "common.lastActive"))}: ${escapeHtml(device.lastActiveLabel)}</p>
                ${device.current ? "" : `<button class="text-button" type="button" data-revoke-device="${device.id}">${escapeHtml(t(language, "common.revoke"))}</button>`}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderModulePreview(activeRoute) {
  const module = (navigationByRole.parent ?? []).find((item) => item.route === activeRoute);
  if (!module || activeRoute === APP_ROUTES.parentDashboard) {
    return "";
  }

  return `
    <section class="section-block section-block--preview">
      <div class="section-copy">
        <p class="eyebrow">Module preview</p>
        <h2>${escapeHtml(module.label)} is prepared for the next iteration</h2>
        <p>
          The information architecture is already in place for this parent module. For now, the
          dashboard remains the primary fully usable experience.
        </p>
      </div>
    </section>
  `;
}

function renderChildren(children) {
  if (children.length === 0) {
    return `
      <article class="empty-card">
        <p class="eyebrow">Child overview</p>
        <h3>No child linked yet</h3>
        <p>
          Your school account is active, but no student profile is linked yet. The admissions or
          parent-relations team can complete the connection for you.
        </p>
      </article>
    `;
  }

  return children
    .map(
      (child) => `
        <article class="child-card">
          <div class="child-card__top">
            <div>
              <p class="eyebrow">Student</p>
              <h3>${escapeHtml(child.fullName)}</h3>
            </div>
            <span class="status-pill">${escapeHtml(child.statusTone)}</span>
          </div>
          <p class="child-card__grade">${escapeHtml(child.gradeLabel)} · ${escapeHtml(child.classLabel ?? "")}</p>
          <p class="child-card__metric">${escapeHtml(child.attendanceSummary)}</p>
          <p class="child-card__highlight">${escapeHtml(child.latestHighlight)}</p>
          <small>${escapeHtml(child.school?.name ?? "")}</small>
        </article>
      `
    )
    .join("");
}

function renderQuickStats(stats) {
  return stats
    .map(
      (stat) => `
        <article class="stat-card stat-card--showcase">
          <p class="eyebrow">${escapeHtml(stat.label)}</p>
          <h3>${escapeHtml(stat.value)}</h3>
          <p>${escapeHtml(stat.detail)}</p>
        </article>
      `
    )
    .join("");
}

function renderComplaints(complaintState) {
  if (complaintState.empty) {
    return `
      <div class="panel-card panel-card--soft panel-card--inner">
        <p class="eyebrow">${escapeHtml(complaintState.title)}</p>
        <h3>Everything is currently on track</h3>
        <p>${escapeHtml(complaintState.description)}</p>
      </div>
    `;
  }

  const items = complaintState.items
    .map(
      (item) => `
        <article class="list-card">
          <div class="list-card__header">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="status-pill status-pill--alert">${escapeHtml(item.status)}</span>
          </div>
          <p>${escapeHtml(item.summary)}</p>
          <small>Opened ${escapeHtml(item.openedAt)}</small>
        </article>
      `
    )
    .join("");

  return `
    <div class="stack">
      <div class="section-copy">
        <p class="eyebrow">${escapeHtml(complaintState.title)}</p>
        <h3>Open complaints and reclamations</h3>
        <p>${escapeHtml(complaintState.description)}</p>
      </div>
      ${items}
    </div>
  `;
}

function renderUpdates(updates) {
  return updates
    .map(
      (item) => `
        <article class="list-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderQuickActions(actions) {
  return actions
    .map(
      (item) => `
        <a class="action-card" href="${item.route}">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
          <span>Prepare module</span>
        </a>
      `
    )
    .join("");
}

function renderWorkspaceMetrics(metrics) {
  return metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <p class="eyebrow">${escapeHtml(metric.label)}</p>
          <h3>${escapeHtml(metric.value)}</h3>
          <p>${escapeHtml(metric.detail)}</p>
        </article>
      `
    )
    .join("");
}

function renderPriorities(priorities) {
  return priorities
    .map(
      (item) => `
        <article class="priority-card">
          <p>${escapeHtml(item)}</p>
        </article>
      `
    )
    .join("");
}

function renderChildSwitcher(viewModel) {
  if (!viewModel.hasChildren) {
    return "";
  }

  return `
    <div class="child-switcher">
      ${viewModel.childTabs
        .map(
          (child) => `
            <button
              class="child-switcher__button${child.isActive ? " child-switcher__button--active" : ""}"
              type="button"
              data-select-child="${child.id}"
            >
              <span class="child-switcher__avatar">${escapeHtml(child.initials)}</span>
              <span>
                <strong>${escapeHtml(child.fullName)}</strong>
                <small>${escapeHtml(child.gradeLabel)} · ${escapeHtml(child.schoolName)}</small>
              </span>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderDashboardHero(viewModel) {
  if (!viewModel.activeChild) {
    return `
      <section class="hero-summary hero-summary--single">
        <article class="hero-summary__card">
          <p class="eyebrow">Child overview</p>
          <h3>No child linked yet</h3>
          <p>
            Your parent account is active, but the school has not linked a student profile yet.
            Once the link is completed, this home screen will show the child's daily picture immediately.
          </p>
        </article>
      </section>
    `;
  }

  return `
    <section class="dashboard-hero-card">
      <div class="dashboard-hero-card__media">
        <div class="student-avatar">${escapeHtml(viewModel.activeChildInitials)}</div>
      </div>
      <div class="dashboard-hero-card__content">
        <p class="eyebrow">Child overview</p>
        <h2>${escapeHtml(viewModel.activeChild.fullName)}</h2>
        <p>${escapeHtml(viewModel.activeChild.classLabel)} · ${escapeHtml(viewModel.activeChild.gradeLabel)} · ${escapeHtml(viewModel.activeChild.school.name)}</p>
        <div class="summary-strip">
          <span>${escapeHtml(viewModel.summaryStrip.fees)}</span>
          <span>${escapeHtml(viewModel.summaryStrip.events)}</span>
          <span>${escapeHtml(viewModel.summaryStrip.transport)}</span>
        </div>
        <p class="dashboard-hero-card__highlight">${escapeHtml(viewModel.activeChild.latestHighlight)}</p>
      </div>
      <div class="dashboard-hero-card__switcher">
        <p class="eyebrow">Switch child</p>
        ${renderChildSwitcher(viewModel)}
      </div>
    </section>
  `;
}

function renderAlerts(alerts) {
  return alerts
    .map(
      (item) => `
        <article class="alert-item alert-item--${escapeHtml(item.tone)}">
          <div class="alert-item__icon">${item.tone === "warning" ? "!" : item.tone === "info" ? "i" : "•"}</div>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderSchedule(schedule) {
  if (!schedule.length) {
    return `<p>No lessons scheduled yet.</p>`;
  }

  return `
    <div class="schedule-strip">
      ${schedule.map((item) => `<span class="schedule-pill">${escapeHtml(item.time)} ${escapeHtml(item.subject)}</span>`).join("")}
    </div>
  `;
}

function renderParentHomeModules(viewModel) {
  return `
    ${renderDashboardHero(viewModel)}

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">Quick stats</p>
        <h2>Academic and daily signals</h2>
        <p>The most important indicators are visible immediately for the selected child.</p>
      </div>
      <div class="stat-grid stat-grid--three">
        ${renderQuickStats(viewModel.quickStats)}
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Alerts & action required</p>
          <h2>Things needing your attention</h2>
          <p>Fees, approvals, meetings, and study reminders are grouped in one calm place.</p>
        </div>
        <div class="stack">
          ${renderAlerts(viewModel.alerts)}
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Today's schedule</p>
          <h2>Day plan</h2>
          <p>Today's classes and activities for the selected child.</p>
        </div>
        ${renderSchedule(viewModel.schedule)}
      </section>
    </section>

    <section class="three-up-grid">
      <article class="panel-card panel-card--compact">
        <p class="eyebrow">Transport status</p>
        <h3>${escapeHtml(viewModel.transport.status)}</h3>
        <p>${escapeHtml(viewModel.transport.detail)}</p>
        <span class="transport-pill">${escapeHtml(viewModel.transport.toneLabel)}</span>
      </article>

      <article class="panel-card panel-card--compact">
        <p class="eyebrow">Latest school news</p>
        <h3>${escapeHtml(viewModel.latestNews)}</h3>
        <p>Fresh communication appears here without opening a separate feed.</p>
      </article>

      <article class="panel-card panel-card--compact panel-card--achievement">
        <p class="eyebrow">Child's achievement</p>
        <h3>${escapeHtml(viewModel.achievement)}</h3>
        <p>Positive recognition and milestones stay visible for the family.</p>
      </article>
    </section>
  `;
}

export function renderLoginTemplate({
  language,
  authMode,
  errorMessage = "",
  recoveryMessage = "",
  biometricMessage = "",
  demoOptions,
  invites,
  biometricReady = false,
  showRecovery = false
}) {
  const languageMeta = getLanguageMeta(language);
  const helperText =
    authMode === "access-code"
      ? t(language, "auth.accessHint")
      : authMode === "qr"
        ? t(language, "auth.qrHint")
        : t(language, "auth.loginHint");

  const formBody =
    authMode === "access-code"
      ? renderAccessCodeFields(language)
      : authMode === "qr"
        ? `
          <div class="qr-grid">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">${escapeHtml(t(language, "auth.qrTitle"))}</p>
              <h3>${escapeHtml(t(language, "auth.qrTitle"))}</h3>
              <p>${escapeHtml(t(language, "auth.qrBody"))}</p>
            </div>
            ${renderQrCards(language, invites)}
          </div>
        `
        : renderCredentialsFields(language);

  return `
    <main class="login-shell" dir="${languageMeta.dir}">
      <section class="login-hero">
        ${renderLanguageSelector(language)}
        <div class="brand-chip">${escapeHtml(t(language, "auth.chip"))}</div>
        <h1>${escapeHtml(t(language, "auth.title"))}</h1>
        <p>${escapeHtml(t(language, "auth.body"))}</p>
        <div class="hero-panel">
          <p class="hero-panel__label">${escapeHtml(t(language, "auth.roleList"))}</p>
          <ul class="hero-list">
            <li>Super Admin and School Admin</li>
            <li>Teacher and Parent</li>
            <li>Transport Driver and Supervisor</li>
          </ul>
        </div>
      </section>

      <section class="login-card">
        <div class="login-card__header">
          <p class="eyebrow">${escapeHtml(APP_NAME)}</p>
          <h2>${escapeHtml(t(language, "auth.signInTitle"))}</h2>
          <p>${escapeHtml(authMode === "access-code" ? t(language, "auth.accessCodeBody") : authMode === "qr" ? t(language, "auth.qrBody") : t(language, "auth.signInBody"))}</p>
        </div>

        ${renderAuthTabs(language, authMode)}

        ${
          authMode === "qr"
            ? formBody
            : `
              <form id="login-form" class="login-form" novalidate>
                ${formBody}
                ${
                  errorMessage
                    ? `<p class="form-message form-message--error" role="alert">${escapeHtml(errorMessage)}</p>`
                    : `<p class="form-message">${escapeHtml(helperText)}</p>`
                }
                <button class="button button--primary" type="submit">${escapeHtml(t(language, "auth.continue"))}</button>
              </form>
            `
        }

        ${
          biometricReady
            ? `
              <div class="biometric-block">
                <p>${escapeHtml(t(language, "auth.biometricBody"))}</p>
                <button class="button button--ghost" type="button" data-biometric-login>${escapeHtml(t(language, "auth.biometric"))}</button>
                ${biometricMessage ? `<p class="form-message">${escapeHtml(biometricMessage)}</p>` : ""}
              </div>
            `
            : ""
        }

        <button class="text-button" type="button" data-toggle-recovery>${escapeHtml(t(language, "auth.forgotPassword"))}</button>
        ${showRecovery ? renderRecoveryPanel(language, recoveryMessage) : ""}

        <div class="demo-block">
          <div class="demo-block__header">
            <h3>${escapeHtml(t(language, "auth.demoTitle"))}</h3>
            <p>${escapeHtml(t(language, "auth.demoBody"))}</p>
          </div>
          <div class="demo-grid demo-grid--wide">
            ${renderDemoCards(demoOptions)}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function renderJoinTemplate({ language, invite }) {
  const languageMeta = getLanguageMeta(language);
  if (!invite) {
    return `
      <main class="join-shell" dir="${languageMeta.dir}">
        <section class="join-card">
          ${renderLanguageSelector(language)}
          <p class="eyebrow">${escapeHtml(APP_NAME)}</p>
          <h1>${escapeHtml(t(language, "join.title"))}</h1>
          <p>${escapeHtml(t(language, "join.invalid"))}</p>
          <a class="button button--secondary" href="${APP_ROUTES.login}">${escapeHtml(t(language, "join.back"))}</a>
        </section>
      </main>
    `;
  }

  return `
    <main class="join-shell" dir="${languageMeta.dir}">
      <section class="join-card">
        ${renderLanguageSelector(language)}
        <p class="eyebrow">${escapeHtml(APP_NAME)}</p>
        <h1>${escapeHtml(t(language, "join.title"))}</h1>
        <p>${escapeHtml(t(language, "join.subtitle"))}</p>
        <div class="join-grid">
          <article class="panel-card panel-card--inner">
            <p class="eyebrow">${escapeHtml(t(language, "join.linkedChildren"))}</p>
            <h3>${escapeHtml(invite.title)}</h3>
            <ul class="plain-list">${invite.linkedChildren.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
          <article class="panel-card panel-card--inner">
            <p class="eyebrow">${escapeHtml(t(language, "join.linkedSchools"))}</p>
            <ul class="plain-list">${invite.linkedSchools.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
        </div>
        <div class="join-actions">
          <button class="button button--primary" type="button" data-accept-invite="${invite.inviteCode}">${escapeHtml(t(language, "join.continue"))}</button>
          <a class="button button--ghost" href="${APP_ROUTES.login}">${escapeHtml(t(language, "join.back"))}</a>
        </div>
      </section>
    </main>
  `;
}

export function renderOnboardingTemplate({ language, stepIndex, totalSlides, slide, displayName }) {
  const languageMeta = getLanguageMeta(language);

  return `
    <main class="onboarding-shell" dir="${languageMeta.dir}">
      <section class="onboarding-card">
        ${renderLanguageSelector(language)}
        <p class="eyebrow">${escapeHtml(APP_NAME)}</p>
        <h1>${escapeHtml(t(language, "onboarding.title"))}</h1>
        <p>${escapeHtml(t(language, "onboarding.subtitle"))}</p>
        <div class="onboarding-stage">
          <span class="step-pill">${escapeHtml(t(language, "onboarding.step"))} ${stepIndex + 1}/${totalSlides}</span>
          <h2>${escapeHtml(slide.title)}</h2>
          <p>${escapeHtml(slide.body)}</p>
          <div class="onboarding-welcome">${escapeHtml(displayName)}</div>
        </div>
        <div class="onboarding-dots">${Array.from({ length: totalSlides }, (_, index) => `<span class="onboarding-dot${index === stepIndex ? " onboarding-dot--active" : ""}"></span>`).join("")}</div>
        <div class="onboarding-actions">
          <button class="button button--ghost" type="button" data-onboarding-action="back">${escapeHtml(t(language, "onboarding.back"))}</button>
          <button class="button button--secondary" type="button" data-onboarding-action="skip">${escapeHtml(t(language, "onboarding.skip"))}</button>
          <button class="button button--primary" type="button" data-onboarding-action="next">${escapeHtml(stepIndex === totalSlides - 1 ? t(language, "onboarding.finish") : t(language, "onboarding.next"))}</button>
        </div>
      </section>
    </main>
  `;
}

export function renderParentDashboardTemplate(viewModel, activeRoute = APP_ROUTES.parentDashboard, language = "en") {
  return `
    <div class="dashboard-shell">
      ${renderSidebar(viewModel, activeRoute, language)}

      <main class="dashboard-main">
        ${renderWorkspaceTopbar(viewModel, t(language, "common.parentDashboard"), language)}

        ${renderModulePreview(activeRoute)}
        ${renderParentHomeModules(viewModel)}

        <section class="two-column two-column--balanced two-column--secondary">
          <section class="panel-card">
            ${renderComplaints(viewModel.complaintState)}
          </section>
          <section class="panel-card">
            <div class="section-copy">
              <p class="eyebrow">Recent updates</p>
              <h2>Latest school communication</h2>
              <p>Important notices and teacher or school updates appear here first.</p>
            </div>
            <div class="stack">
              ${renderUpdates(viewModel.recentUpdates)}
            </div>
          </section>
        </section>

        <section class="section-block">
          <div class="section-copy">
            <p class="eyebrow">Quick actions</p>
            <h2>Premium services rolling out next</h2>
            <p>These entry points give the MVP a clean path toward the broader school platform vision.</p>
          </div>
          <div class="action-grid">
            ${renderQuickActions(viewModel.quickActions)}
          </div>
        </section>

        ${renderDeviceSection(viewModel, language)}
      </main>
    </div>
  `;
}

export function renderRoleWorkspaceTemplate(viewModel, activeRoute, language = "en") {
  return `
    <div class="dashboard-shell">
      ${renderSidebar(viewModel, activeRoute, language)}

      <main class="dashboard-main">
        ${renderWorkspaceTopbar(viewModel, `${viewModel.roleLabel} ${t(language, "common.roleWorkspace")}`, language)}

        <section class="hero-summary">
          <article class="hero-summary__card">
            <p class="eyebrow">${escapeHtml(t(language, "common.roleFoundation"))}</p>
            <h3>${escapeHtml(viewModel.title)}</h3>
            <p>${escapeHtml(viewModel.description)}</p>
          </article>
          <article class="hero-summary__card hero-summary__card--accent">
            <p class="eyebrow">Access</p>
            <h3>${escapeHtml(viewModel.roleLabel)}</h3>
            <p>${escapeHtml(viewModel.school.name)}</p>
            <small>Role-based routing and seeded data are now active.</small>
          </article>
        </section>

        <section class="section-block">
          <div class="section-copy">
            <p class="eyebrow">${escapeHtml(t(language, "common.operationalSignals"))}</p>
            <h2>Workspace metrics</h2>
            <p>This role now has a dedicated landing route, seed data, and a clear path for module-by-module development.</p>
          </div>
          <div class="metric-grid">
            ${renderWorkspaceMetrics(viewModel.metrics)}
          </div>
        </section>

        <section class="section-block">
          <div class="section-copy">
            <p class="eyebrow">${escapeHtml(t(language, "common.priorities"))}</p>
            <h2>What this role will manage first</h2>
            <p>These placeholders keep the information architecture clean until each module is implemented in depth.</p>
          </div>
          <div class="priority-list">
            ${renderPriorities(viewModel.priorities)}
          </div>
        </section>

        ${renderDeviceSection(viewModel, language)}
      </main>
    </div>
  `;
}

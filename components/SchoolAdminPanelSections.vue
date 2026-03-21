<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  SchoolAdminClassRecord,
  SchoolAdminEntityRecord,
  SchoolAdminEventRecord,
  SchoolAdminForecastRecord,
  SchoolAdminPanelView
} from '~/shared/app/types'

const props = defineProps<{
  viewModel: SchoolAdminPanelView
}>()

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function eventBadge(item: SchoolAdminEventRecord) {
  return `${formatTimestamp(item.startsAt)} · ${item.location}`
}

function transferLabel(item: SchoolAdminClassRecord) {
  return item.transferRequests === 0 ? 'No transfers pending' : `${item.transferRequests} transfer request(s)`
}

function confidenceClass(item: SchoolAdminForecastRecord) {
  if (item.confidence === 'high') return 'status-pill'
  if (item.confidence === 'medium') return 'status-pill status-pill--neutral'
  return 'status-pill status-pill--warning'
}

function formatChannel(value: string) {
  return value.replace('_', ' ')
}

function statusClass(item: SchoolAdminEntityRecord) {
  if (/urgent|conflict|action required|needs/i.test(item.status)) return 'status-pill status-pill--alert'
  if (/queued|scheduled|pending|review|watch/i.test(item.status)) return 'status-pill status-pill--warning'
  if (/enabled|healthy|ready|completed|top performer|highly engaged|healthy profile/i.test(item.status)) return 'status-pill status-pill--neutral'
  return 'status-pill'
}

function securityStatusClass(status: string) {
  if (/enforced|protected|compliant|healthy|enabled|live|ready/i.test(status)) return 'status-pill'
  if (/scheduled|reviewed|active|streaming/i.test(status)) return 'status-pill status-pill--neutral'
  return 'status-pill status-pill--warning'
}
</script>

<template>
  <div>
    <motion.section
      class="dashboard-hero-card admin-hero"
      :initial="{ opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35 }"
    >
      <div class="dashboard-hero-card__content">
        <p class="eyebrow">Module 13</p>
        <h2>School Admin Panel</h2>
        <p>{{ props.viewModel.school.name }} operations dashboard with student, parent, teacher, finance, communication, reporting, and settings controls in one workspace.</p>
        <div class="summary-strip">
          <span>{{ props.viewModel.dashboard.heroStats[0]?.value ?? '0' }} students</span>
          <span>{{ props.viewModel.dashboard.heroStats[2]?.value ?? '0%' }} collection</span>
          <span>{{ props.viewModel.dashboard.upcomingEvents.length }} upcoming event(s)</span>
        </div>
        <p class="dashboard-hero-card__highlight">The admin route now behaves like a real control center instead of a placeholder screen.</p>
      </div>

      <div class="dashboard-hero-card__switcher">
        <p class="eyebrow">Revenue pulse</p>
        <div class="stack stack--compact">
          <article class="list-card">
            <h3>{{ props.viewModel.financialManagement.revenueThisMonth }}</h3>
            <p>This month</p>
          </article>
          <article class="list-card">
            <h3>{{ props.viewModel.financialManagement.revenueLastMonth }}</h3>
            <p>Last month</p>
          </article>
          <article class="list-card">
            <h3>{{ props.viewModel.financialManagement.revenueDeltaLabel }}</h3>
            <p>Month-over-month revenue movement</p>
          </article>
        </div>
      </div>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">13.1 Admin dashboard</p>
        <h2>Live operational signals</h2>
        <p>Total students, active parents, collections, complaints, attendance, NPS, revenue, and upcoming events are visible immediately.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.dashboard.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Upcoming events</p>
            <h3>What operations needs to support next</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.dashboard.upcomingEvents" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <p class="eyebrow">{{ eventBadge(item) }}</p>
                  <h3>{{ item.title }}</h3>
                </div>
                <span class="status-pill status-pill--neutral">{{ item.audience }}</span>
              </div>
              <p>{{ item.detail }}</p>
            </article>
          </div>
        </section>
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Quick actions</p>
            <h3>Fast paths for daily admin work</h3>
          </div>
          <div class="action-grid action-grid--compact">
            <article v-for="item in props.viewModel.dashboard.quickActions" :key="item.id" class="action-card action-card--admin">
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <span>{{ item.ctaLabel }}</span>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">13.2 Student management</p>
        <h2>Add, assign, transfer, import, and archive</h2>
        <p>The student area covers record lifecycle, class assignment, transfer handling, bulk import, and the document vault.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.studentManagement.stats" :key="stat.label" class="stat-card">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
        <section class="panel-card">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Class assignments</p>
            <h3>Roster and transfer control</h3>
          </div>
          <div class="class-grid">
            <article v-for="item in props.viewModel.studentManagement.classes" :key="item.id" class="subject-card subject-card--compact">
              <div class="subject-card__header">
                <div>
                  <p class="eyebrow">{{ item.homeroomTeacher }}</p>
                  <h3>{{ item.classLabel }}</h3>
                </div>
              </div>
              <p>{{ item.studentCount }} students · {{ item.attendanceRate }} attendance</p>
              <small>{{ transferLabel(item) }}</small>
            </article>
          </div>
        </section>
        <section class="panel-card">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Student spotlight</p>
            <h3>Profiles needing attention</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.studentManagement.students" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
                <span :class="statusClass(item)">{{ item.status }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.meta }}</small>
            </article>
          </div>
        </section>
      </div>
      <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Bulk import</p>
            <h3>Excel and CSV intake</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.studentManagement.imports" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
                <span :class="statusClass(item)">{{ item.status }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.meta }}</small>
            </article>
          </div>
        </section>
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Documents vault</p>
            <h3>Student record compliance</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.studentManagement.documents" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
                <span :class="statusClass(item)">{{ item.status }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.meta }}</small>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">13.3 Parent management</p>
          <h2>Accounts, access, engagement, and communication</h2>
          <p>Add and link parents, issue QR or access codes, inspect engagement signals, and control account state.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.parentManagement.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="item in props.viewModel.parentManagement.parents" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.subtitle }}</p>
              </div>
              <span :class="statusClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>{{ item.meta }}</small>
          </article>
        </div>
        <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
          <section class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Access codes and QR</p>
              <h3>Activation queue</h3>
            </div>
            <div class="stack stack--compact">
              <article v-for="item in props.viewModel.parentManagement.access" :key="item.id" class="list-card">
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
                <small>{{ item.status }} · {{ item.meta }}</small>
              </article>
            </div>
          </section>
          <section class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Controls</p>
              <h3>Block and deactivate</h3>
            </div>
            <div class="stack stack--compact">
              <article v-for="item in props.viewModel.parentManagement.controls" :key="item.id" class="list-card">
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
                <small>{{ item.status }} · {{ item.meta }}</small>
              </article>
            </div>
          </section>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Communication history</p>
          <h3>Where parent service is concentrated</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.parentManagement.communications" :key="item.id" class="alert-item alert-item--calm">
            <div class="alert-item__icon">i</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.status }} · {{ item.meta }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">13.4 Teacher management</p>
          <h2>Assignments, metrics, timetable, and app access</h2>
          <p>Teacher performance and timetable issues stay in the same operational flow as access control and class ownership.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.teacherManagement.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="item in props.viewModel.teacherManagement.teachers" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.subtitle }}</p>
              </div>
              <span :class="statusClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>{{ item.meta }}</small>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Timetable management</p>
          <h3>Open schedule issues</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.teacherManagement.timetables" :key="item.id" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.status }} · {{ item.meta }}</small>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">13.5 Financial management</p>
        <h2>Invoicing, reminders, exports, and forecasting</h2>
        <p>Billing health, outstanding balances, reminder automation, accounting handoff, and forecast confidence are all visible in one place.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.financialManagement.stats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
        <section class="panel-card">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Outstanding payments</p>
            <h3>Where finance follow-up is focused</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.financialManagement.outstanding" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
                <span :class="statusClass(item)">{{ item.status }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>{{ item.meta }}</small>
            </article>
          </div>
          <div class="section-copy section-copy--tight" style="margin-top: 18px;">
            <p class="eyebrow">Auto-reminders</p>
            <h3>Configured finance rules</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.financialManagement.reminders" :key="item.id" class="list-card">
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.status }} · {{ item.meta }}</small>
            </article>
          </div>
        </section>

        <section class="panel-card">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Reports and exports</p>
            <h3>Finance output</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.financialManagement.exports" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.label }}</h3>
                  <p>{{ item.detail }}</p>
                </div>
                <span class="status-pill status-pill--neutral">{{ item.format.toUpperCase() }}</span>
              </div>
            </article>
          </div>
          <div class="section-copy section-copy--tight" style="margin-top: 18px;">
            <p class="eyebrow">Forecasting</p>
            <h3>Projected cash flow</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.financialManagement.forecast" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.label }}</h3>
                  <p>{{ item.detail }}</p>
                </div>
                <span :class="confidenceClass(item)">{{ item.confidence }}</span>
              </div>
              <strong class="forecast-value">{{ item.amountLabel }}</strong>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">13.6 Communication center</p>
          <h2>Announcements, approvals, conversations, templates, and schedules</h2>
          <p>This area centralizes outbound communication while keeping approval workflows and direct-parent activity visible.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.communicationCenter.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Announcements</p>
          <h3>Drafts and campaigns</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.communicationCenter.announcements" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.subtitle }}</p>
              </div>
              <span :class="statusClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>{{ item.meta }}</small>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Approval requests</p>
          <h3>Items needing parent action</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.communicationCenter.approvals" :key="item.id" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.status }} · {{ item.meta }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">13.7 Reports and analytics</p>
          <h2>Export packs, insights, and custom builder blocks</h2>
          <p>Academic, attendance, finance, engagement, and complaint analysis all have export-ready output paths.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.reports.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Export packs</p>
          <h3>Ready-made reports</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.reports.exports" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.label }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ item.format.toUpperCase() }}</span>
            </div>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Analysis highlights</p>
          <h3>What the data is saying</h3>
        </div>
        <div class="priority-list">
          <article v-for="item in props.viewModel.reports.highlights" :key="item" class="priority-card">
            <p>{{ item }}</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Custom report builder</p>
          <h3>Reusable report blocks</h3>
        </div>
        <div class="pill-row">
          <span v-for="item in props.viewModel.reports.builderBlocks" :key="item" class="status-pill status-pill--neutral">{{ item }}</span>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Templates and schedules</p>
          <h2>Message operations</h2>
          <p>The template library and scheduled messages keep recurring communication fast and consistent.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.communicationCenter.templates" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.audience }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ formatChannel(item.channel) }}</span>
            </div>
            <small>Last used {{ formatTimestamp(item.lastUsedAt) }}</small>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Scheduled messages</p>
          <h3>Upcoming sends</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.communicationCenter.scheduled" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.subtitle }}</p>
              </div>
              <span :class="statusClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>{{ item.meta }}</small>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">13.8 Settings</p>
          <h2>Policy, branding, academic year, roles, and integrations</h2>
          <p>Configuration stays operational rather than hidden, so admins can see which settings are ready, locked, or due for review.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.settings.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="item in props.viewModel.settings.items" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
              </div>
              <span class="status-pill status-pill--neutral">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">15.1 Security and privacy operations</p>
        <h2>Compliance, identity, and resilience in one school view</h2>
        <p>Module 15 keeps security posture visible for daily admin work, from two-factor coverage to parental consent, deletion requests, audit logging, and backup readiness.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.securityPrivacy.stats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <div class="security-grid" style="margin-top: 18px;">
        <article v-for="item in props.viewModel.securityPrivacy.controls" :key="item.id" class="panel-card panel-card--inner panel-card--soft">
          <div class="list-card__header">
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
            </div>
            <span :class="securityStatusClass(item.status)">{{ item.status }}</span>
          </div>
          <small>{{ item.meta }}</small>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">15.2 Privacy requests and consent</p>
          <h2>Keep family rights operational</h2>
          <p>Consent history, deletion requests, and analytics anonymization are managed as living service workflows instead of policy documents that nobody sees.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.securityPrivacy.compliance" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span :class="securityStatusClass(item.status)">{{ item.status }}</span>
            </div>
            <small>{{ item.meta }}</small>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">15.3 Audit and resilience</p>
          <h2>Security proof, backups, and hosting readiness</h2>
          <p>The school can see which controls prove accountability and which resilience checks protect families if something goes wrong.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.securityPrivacy.resilience" :key="item.id" class="alert-item alert-item--calm">
            <div class="alert-item__icon">i</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.status }} | {{ item.meta }}</small>
            </div>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.admin-hero {
  align-items: stretch;
}

.action-card--admin {
  min-height: 180px;
}

.action-grid--compact {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.class-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.security-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.forecast-value {
  font-size: 1.15rem;
  color: #0f172a;
}
</style>

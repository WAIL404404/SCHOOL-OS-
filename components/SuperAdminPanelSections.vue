<script setup lang="ts">
import { motion } from 'motion-v'
import type { SuperAdminAnnouncementRecord, SuperAdminHealthRecord, SuperAdminPanelView, SuperAdminSupportTicketRecord, SuperAdminSubscriptionRecord } from '~/shared/app/types'

const props = defineProps<{
  viewModel: SuperAdminPanelView
}>()

function formatMad(amount: number) {
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatTimestamp(value: string | null) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function healthClass(item: SuperAdminHealthRecord) {
  if (item.status === 'degraded') return 'status-pill status-pill--alert'
  if (item.status === 'warning') return 'status-pill status-pill--warning'
  return 'status-pill'
}

function ticketClass(item: SuperAdminSupportTicketRecord) {
  if (item.priority === 'urgent') return 'status-pill status-pill--alert'
  if (item.priority === 'high') return 'status-pill status-pill--warning'
  if (item.status === 'resolved') return 'status-pill'
  return 'status-pill status-pill--neutral'
}

function subscriptionClass(item: SuperAdminSubscriptionRecord) {
  if (item.status === 'past_due') return 'status-pill status-pill--alert'
  if (item.status === 'trial') return 'status-pill status-pill--warning'
  if (item.status === 'cancelled') return 'status-pill status-pill--neutral'
  return 'status-pill'
}

function announcementClass(item: SuperAdminAnnouncementRecord) {
  if (item.status === 'scheduled') return 'status-pill status-pill--warning'
  if (item.status === 'draft') return 'status-pill status-pill--neutral'
  return 'status-pill'
}

function stageLabel(stage: string) {
  if (stage === 'contract') return 'Contract'
  if (stage === 'branding') return 'Branding'
  if (stage === 'setup') return 'Setup'
  if (stage === 'training') return 'Training'
  return 'Launch'
}

function stageClass(stage: string) {
  if (stage === 'launch') return 'status-pill'
  if (stage === 'training') return 'status-pill status-pill--neutral'
  if (stage === 'setup') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--alert'
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
        <p class="eyebrow">Module 14</p>
        <h2>Super Admin Control Center</h2>
        <p>Platform-wide visibility across schools, revenue, active users, support tickets, feature flags, and white-label configuration.</p>
        <div class="summary-strip">
          <span>{{ props.viewModel.heroStats[0]?.value ?? '0' }} schools</span>
          <span>{{ props.viewModel.heroStats[1]?.value ?? 'MAD 0' }} revenue</span>
          <span>{{ props.viewModel.heroStats[2]?.value ?? '0' }} active users</span>
        </div>
        <p class="dashboard-hero-card__highlight">This view is the system owner dashboard: it monitors the whole platform and the schools running on it.</p>
      </div>
      <div class="dashboard-hero-card__switcher">
        <p class="eyebrow">Quick actions</p>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.quickActions" :key="item.id" class="list-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
            <small>{{ item.ctaLabel }}</small>
          </article>
        </div>
      </div>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">14.1 Portfolio overview</p>
        <h2>All schools in one glance</h2>
        <p>School health, billing state, onboarding status, and white-label readiness are visible across the platform portfolio.</p>
      </div>
      <div class="stat-grid stat-grid--three">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <div class="school-grid" style="margin-top: 18px;">
        <article v-for="school in props.viewModel.schools" :key="school.id" class="panel-card panel-card--inner panel-card--soft">
          <div class="list-card__header">
            <div>
              <p class="eyebrow">{{ school.planName }}</p>
              <h3>{{ school.schoolName }}</h3>
            </div>
            <span :class="school.serverHealthLabel === 'Warning' ? 'status-pill status-pill--warning' : 'status-pill'">{{ school.serverHealthLabel }}</span>
          </div>
          <div class="summary-strip summary-strip--muted">
            <span>{{ formatMad(school.revenueMad) }}</span>
            <span>{{ school.activeUsers }} active users</span>
            <span>{{ formatPercent(school.retentionRate) }} retention</span>
          </div>
          <div class="stack stack--compact" style="margin-top: 14px;">
            <article class="list-card">
              <h3>Support and billing</h3>
              <p>{{ school.supportTicketsOpen }} open ticket(s) | {{ school.billingStatus }}</p>
            </article>
            <article class="list-card">
              <h3>Feature health</h3>
              <p>{{ formatPercent(school.featureUsageRate) }} feature usage | {{ formatPercent(school.churnRate) }} churn</p>
            </article>
            <article class="list-card">
              <h3>Onboarding and branding</h3>
              <p>{{ school.onboardingStatus }} | {{ school.whiteLabelStatus }}</p>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.2 Revenue and users</p>
          <h2>Billing and adoption by school</h2>
          <p>Revenue per school, plan, and monthly growth stays visible alongside active user counts and account adoption.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.revenue" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.schoolName }}</h3>
                <p>{{ item.planName }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ item.deltaLabel }}</span>
            </div>
            <p>{{ formatMad(item.revenueMad) }} | Renewal {{ item.renewalDate }}</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Active users</p>
          <h3>School-wide user counts</h3>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="item in props.viewModel.users" :key="item.id" class="stat-card">
            <p class="eyebrow">{{ item.schoolName }}</p>
            <h3>{{ item.activeUsers }}</h3>
            <p>{{ item.activeParents }} parents | {{ item.teachers }} teachers | {{ item.growthLabel }}</p>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.3 Churn and retention</p>
          <h2>Retention health across the portfolio</h2>
          <p>Churn pressure is measured monthly so the team can act before renewals are lost.</p>
        </div>
        <div class="stat-grid stat-grid--two">
          <article class="stat-card">
            <p class="eyebrow">Churn rate</p>
            <h3>{{ formatPercent(props.viewModel.churn.rate) }}</h3>
            <p>{{ props.viewModel.churn.detail }}</p>
          </article>
          <article class="stat-card">
            <p class="eyebrow">Retention</p>
            <h3>{{ formatPercent(props.viewModel.churn.retentionRate) }}</h3>
            <p>Monthly retention across active partner schools</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Trend</p>
          <h3>Recent churn history</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.churn.history" :key="item.label" class="list-card">
            <div class="list-card__header">
              <h3>{{ item.label }}</h3>
              <span class="status-pill status-pill--neutral">{{ formatPercent(item.rate) }}</span>
            </div>
            <p>{{ item.detail }}</p>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Feature usage analytics</p>
          <h3>Platform module adoption</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.featureUsage" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.feature }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ formatPercent(item.adoptionRate) }}</span>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.4 Server health</p>
          <h2>Performance and service status</h2>
          <p>The platform health panel keeps API, notifications, billing, and storage visible in one place.</p>
        </div>
        <div class="health-grid">
          <article v-for="item in props.viewModel.serverHealth" :key="item.id" class="alert-item" :class="item.status === 'healthy' ? 'alert-item--calm' : item.status === 'warning' ? 'alert-item--warning' : 'alert-item--alert'">
            <div class="alert-item__icon">{{ item.status === 'healthy' ? '*' : item.status === 'warning' ? '!' : 'x' }}</div>
            <div>
              <h3>{{ item.service }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.uptime }}</small>
            </div>
            <span :class="healthClass(item)">{{ item.status }}</span>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.5 Support ticket management</p>
          <h2>Escalations and owner follow-up</h2>
          <p>Tickets are visible by school, priority, and assignment so nothing gets lost in a shared queue.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.supportTickets" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <p class="eyebrow">{{ item.schoolName }}</p>
                <h3>{{ item.title }}</h3>
              </div>
              <span :class="ticketClass(item)">{{ item.priority }}</span>
            </div>
            <p>{{ item.status }} | {{ item.assignedTo }}</p>
            <small>Updated {{ formatTimestamp(item.updatedAt) }}</small>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.6 Onboarding and subscriptions</p>
          <h2>Launch schools and manage billing contracts</h2>
          <p>New partner onboarding and subscription billing stay together so launches and renewals share the same control surface.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.onboarding" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.schoolName }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span :class="stageClass(item.stage)">{{ stageLabel(item.stage) }}</span>
            </div>
            <small>{{ item.progress }}% complete</small>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Subscriptions</p>
          <h3>Plan health and renewals</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.subscriptions" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.schoolName }}</h3>
                <p>{{ item.planName }} | {{ item.seats }} seats</p>
              </div>
              <span :class="subscriptionClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ formatMad(item.amountMad) }} | Renewal {{ item.renewalDate }}</p>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">14.7 Feature flags</p>
          <h2>Enable or disable features per school</h2>
          <p>The platform can gate features per school without changing the deployment pipeline.</p>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.featureFlags" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.flag }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ item.enabledSchools }}/{{ item.totalSchools }}</span>
            </div>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">System-wide announcements</p>
          <h3>Platform communication</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.announcements" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.audience }}</p>
              </div>
              <span :class="announcementClass(item)">{{ item.status }}</span>
            </div>
            <p>{{ item.detail }}</p>
            <small>{{ formatTimestamp(item.scheduledAt) }}</small>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">14.8 White label configuration</p>
        <h2>Branding per school</h2>
        <p>School-level branding settings keep the platform white-label ready for each partner school.</p>
      </div>
      <div class="white-label-grid">
        <article v-for="item in props.viewModel.whiteLabel" :key="item.id" class="panel-card panel-card--inner panel-card--soft">
          <div class="list-card__header">
            <div>
              <p class="eyebrow">{{ item.domain }}</p>
              <h3>{{ item.schoolName }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ item.status }}</span>
          </div>
          <div class="summary-strip summary-strip--muted">
            <span>Primary {{ item.primaryColor }}</span>
            <span>Secondary {{ item.secondaryColor }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-hero {
  align-items: stretch;
}

.school-grid,
.white-label-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.health-grid {
  display: grid;
  gap: 12px;
}

.health-grid .alert-item {
  align-items: start;
}

.school-grid .panel-card,
.white-label-grid .panel-card {
  height: 100%;
}
</style>

import { platformBrand, schoolBrand, secondSchoolBrand } from './data.ts'
import type {
  QuickStatView,
  SuperAdminActionRecord,
  SuperAdminAnnouncementRecord,
  SuperAdminFeatureFlagRecord,
  SuperAdminFeatureUsageRecord,
  SuperAdminHealthRecord,
  SuperAdminOnboardingRecord,
  SuperAdminPanelRecord,
  SuperAdminRevenueRecord,
  SuperAdminSchoolOverviewRecord,
  SuperAdminSubscriptionRecord,
  SuperAdminSupportTicketRecord,
  SuperAdminUserRecord,
  SuperAdminWhiteLabelRecord
} from './types.ts'

function stat(label: string, value: string, detail: string): QuickStatView {
  return { label, value, detail }
}

function schoolOverview(payload: SuperAdminSchoolOverviewRecord): SuperAdminSchoolOverviewRecord {
  return payload
}

function revenue(payload: SuperAdminRevenueRecord): SuperAdminRevenueRecord {
  return payload
}

function user(payload: SuperAdminUserRecord): SuperAdminUserRecord {
  return payload
}

function feature(payload: SuperAdminFeatureUsageRecord): SuperAdminFeatureUsageRecord {
  return payload
}

function health(payload: SuperAdminHealthRecord): SuperAdminHealthRecord {
  return payload
}

function ticket(payload: SuperAdminSupportTicketRecord): SuperAdminSupportTicketRecord {
  return payload
}

function onboarding(payload: SuperAdminOnboardingRecord): SuperAdminOnboardingRecord {
  return payload
}

function subscription(payload: SuperAdminSubscriptionRecord): SuperAdminSubscriptionRecord {
  return payload
}

function flag(payload: SuperAdminFeatureFlagRecord): SuperAdminFeatureFlagRecord {
  return payload
}

function announcement(payload: SuperAdminAnnouncementRecord): SuperAdminAnnouncementRecord {
  return payload
}

function whiteLabel(payload: SuperAdminWhiteLabelRecord): SuperAdminWhiteLabelRecord {
  return payload
}

function action(id: string, title: string, detail: string, ctaLabel: string): SuperAdminActionRecord {
  return { id, title, detail, ctaLabel }
}

const superAdminPanel: SuperAdminPanelRecord = {
  heroStats: [
    stat('All schools', '12', 'Active campuses across the platform'),
    stat('Revenue this month', 'MAD 3.4M', 'Across all partner schools and plans'),
    stat('Active users', '8,124', 'Parents, teachers, and administrators'),
    stat('Retention', '96%', 'Monthly school retention across the portfolio'),
    stat('Feature usage', '82%', 'Average active adoption of core modules'),
    stat('Server health', '99.98%', 'Platform uptime during the current cycle')
  ],
  schools: [
    schoolOverview({
      id: schoolBrand.id,
      schoolName: schoolBrand.name,
      planName: 'Premium White Label',
      revenueMad: 684000,
      activeUsers: 2740,
      churnRate: 2.1,
      retentionRate: 97.9,
      featureUsageRate: 84,
      serverHealthLabel: 'Healthy',
      supportTicketsOpen: 7,
      onboardingStatus: 'Live',
      billingStatus: 'Current',
      whiteLabelStatus: 'Custom branded'
    }),
    schoolOverview({
      id: secondSchoolBrand.id,
      schoolName: secondSchoolBrand.name,
      planName: 'Premium Growth',
      revenueMad: 512000,
      activeUsers: 1980,
      churnRate: 2.8,
      retentionRate: 96.4,
      featureUsageRate: 79,
      serverHealthLabel: 'Healthy',
      supportTicketsOpen: 4,
      onboardingStatus: 'Live',
      billingStatus: 'Current',
      whiteLabelStatus: 'Custom branded'
    }),
    schoolOverview({
      id: 'school-oasis',
      schoolName: 'Oasis International School',
      planName: 'Essentials Plus',
      revenueMad: 398000,
      activeUsers: 1490,
      churnRate: 3.4,
      retentionRate: 94.2,
      featureUsageRate: 73,
      serverHealthLabel: 'Warning',
      supportTicketsOpen: 9,
      onboardingStatus: 'Expansion',
      billingStatus: 'Current',
      whiteLabelStatus: 'Review due'
    })
  ],
  revenue: [
    revenue({ id: 'rev-1', schoolName: schoolBrand.name, planName: 'Premium White Label', revenueMad: 684000, deltaLabel: '+12% vs last month', renewalDate: '2026-04-15' }),
    revenue({ id: 'rev-2', schoolName: secondSchoolBrand.name, planName: 'Premium Growth', revenueMad: 512000, deltaLabel: '+8% vs last month', renewalDate: '2026-04-20' }),
    revenue({ id: 'rev-3', schoolName: 'Oasis International School', planName: 'Essentials Plus', revenueMad: 398000, deltaLabel: '+5% vs last month', renewalDate: '2026-04-11' })
  ],
  users: [
    user({ id: 'users-1', schoolName: schoolBrand.name, activeUsers: 2740, totalUsers: 2890, activeParents: 1450, teachers: 116, growthLabel: '+5.2% monthly growth' }),
    user({ id: 'users-2', schoolName: secondSchoolBrand.name, activeUsers: 1980, totalUsers: 2100, activeParents: 1050, teachers: 92, growthLabel: '+4.8% monthly growth' }),
    user({ id: 'users-3', schoolName: 'Oasis International School', activeUsers: 1490, totalUsers: 1625, activeParents: 811, teachers: 74, growthLabel: '+3.7% monthly growth' })
  ],
  churn: {
    rate: 2.8,
    retentionRate: 96.0,
    detail: 'Retention remains high across the premium portfolio, with the only churn risk concentrated in two mid-cycle renewals.',
    history: [
      { label: 'Jan', rate: 3.1, detail: 'Renewal lag in onboarding-heavy schools' },
      { label: 'Feb', rate: 2.9, detail: 'Billing reminders improved retention' },
      { label: 'Mar', rate: 2.8, detail: 'Support response time reduced churn pressure' }
    ]
  },
  featureUsage: [
    feature({ id: 'feature-1', feature: 'Parent messaging', adoptionRate: 94, detail: 'High daily usage across all schools' }),
    feature({ id: 'feature-2', feature: 'Attendance', adoptionRate: 91, detail: 'Used by teachers and admin teams each morning' }),
    feature({ id: 'feature-3', feature: 'Billing', adoptionRate: 86, detail: 'Strong adoption after auto-reminder rollout' }),
    feature({ id: 'feature-4', feature: 'School profile', adoptionRate: 73, detail: 'White-label pages are active on premium accounts' }),
    feature({ id: 'feature-5', feature: 'Reports & analytics', adoptionRate: 69, detail: 'Leadership reports are being downloaded weekly' })
  ],
  serverHealth: [
    health({ id: 'health-1', service: 'API latency', status: 'healthy', uptime: '99.98%', detail: 'Median response remains below the target threshold.' }),
    health({ id: 'health-2', service: 'Notification queue', status: 'healthy', uptime: '99.99%', detail: 'Push and email delivery are operating normally.' }),
    health({ id: 'health-3', service: 'Billing processor', status: 'warning', uptime: '99.91%', detail: 'One retry spike was observed during the last invoice run.' }),
    health({ id: 'health-4', service: 'File storage', status: 'healthy', uptime: '99.99%', detail: 'Document vault sync is stable.' })
  ],
  supportTickets: [
    ticket({ id: 'ticket-1', schoolName: schoolBrand.name, title: 'White-label header spacing issue', priority: 'medium', status: 'in_progress', assignedTo: 'Design operations', updatedAt: '2026-03-20T09:30:00+01:00' }),
    ticket({ id: 'ticket-2', schoolName: secondSchoolBrand.name, title: 'Billing reminder text mismatch', priority: 'high', status: 'waiting_school', assignedTo: 'Finance support', updatedAt: '2026-03-20T10:10:00+01:00' }),
    ticket({ id: 'ticket-3', schoolName: 'Oasis International School', title: 'Account access reactivation', priority: 'urgent', status: 'open', assignedTo: 'Platform support', updatedAt: '2026-03-20T11:00:00+01:00' })
  ],
  onboarding: [
    onboarding({ id: 'onboard-1', schoolName: 'Oasis International School', stage: 'branding', progress: 72, detail: 'Logo, colors, and home page layout are nearly complete.' }),
    onboarding({ id: 'onboard-2', schoolName: 'Luma Academy', stage: 'setup', progress: 48, detail: 'Fee rules and class imports are under review.' }),
    onboarding({ id: 'onboard-3', schoolName: 'Atlas International School', stage: 'launch', progress: 100, detail: 'Go-live checklist completed successfully.' })
  ],
  subscriptions: [
    subscription({ id: 'sub-1', schoolName: schoolBrand.name, planName: 'Premium White Label', status: 'active', amountMad: 684000, renewalDate: '2026-04-15', seats: 1200 }),
    subscription({ id: 'sub-2', schoolName: secondSchoolBrand.name, planName: 'Premium Growth', status: 'active', amountMad: 512000, renewalDate: '2026-04-20', seats: 900 }),
    subscription({ id: 'sub-3', schoolName: 'Oasis International School', planName: 'Essentials Plus', status: 'trial', amountMad: 398000, renewalDate: '2026-04-11', seats: 650 })
  ],
  featureFlags: [
    flag({ id: 'flag-1', flag: 'school-profile', enabledSchools: 12, totalSchools: 12, detail: 'White-label school pages are enabled everywhere.' }),
    flag({ id: 'flag-2', flag: 'complaints-module', enabledSchools: 10, totalSchools: 12, detail: 'Complaint workflows are rolling out by campus.' }),
    flag({ id: 'flag-3', flag: 'analytics-suite', enabledSchools: 12, totalSchools: 12, detail: 'Reporting and analytics are enabled for all schools.' }),
    flag({ id: 'flag-4', flag: 'feature-flag-per-school', enabledSchools: 12, totalSchools: 12, detail: 'Per-school feature targeting is live.' })
  ],
  announcements: [
    announcement({ id: 'announcement-1', title: 'Platform maintenance window', audience: 'All schools', status: 'scheduled', scheduledAt: '2026-03-22T20:00:00+01:00', detail: 'A 45-minute maintenance window will be scheduled after school hours.' }),
    announcement({ id: 'announcement-2', title: 'Billing release notes', audience: 'Finance admins', status: 'draft', scheduledAt: null, detail: 'New invoice automation and reminder options are documented for the next release.' }),
    announcement({ id: 'announcement-3', title: 'White-label design guide', audience: 'School leaders', status: 'sent', scheduledAt: '2026-03-19T09:00:00+01:00', detail: 'A style guide for branding and homepage customization has been shared.' })
  ],
  whiteLabel: [
    whiteLabel({ id: 'wl-1', schoolName: schoolBrand.name, primaryColor: '#a67c00', secondaryColor: '#1f2937', domain: 'summit.schoolos.test', status: 'Custom branded' }),
    whiteLabel({ id: 'wl-2', schoolName: secondSchoolBrand.name, primaryColor: '#2563eb', secondaryColor: '#0f172a', domain: 'atlas.schoolos.test', status: 'Custom branded' }),
    whiteLabel({ id: 'wl-3', schoolName: 'Oasis International School', primaryColor: '#0f766e', secondaryColor: '#042f2e', domain: 'oasis.schoolos.test', status: 'Review due' })
  ],
  quickActions: [
    action('super-action-1', 'Onboard new school', 'Start branding, fee setup, and class import for a new partner.', 'Open onboarding'),
    action('super-action-2', 'Review subscriptions', 'Check plan status, renewals, and billing exceptions across schools.', 'Open billing'),
    action('super-action-3', 'Manage feature flags', 'Enable or disable modules per school without a redeploy.', 'Open flags'),
    action('super-action-4', 'Send platform announcement', 'Broadcast maintenance, release notes, or policy changes.', 'Draft announcement')
  ]
}

export const superAdminPanelById: Record<string, SuperAdminPanelRecord> = {
  [platformBrand.id]: superAdminPanel
}

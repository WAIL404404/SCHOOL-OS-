import { schoolBrand } from './data.ts'
import type {
  QuickStatView,
  SchoolAdminActionRecord,
  SchoolAdminClassRecord,
  SchoolAdminEntityRecord,
  SchoolAdminEventRecord,
  SchoolAdminExportRecord,
  SchoolAdminForecastRecord,
  SchoolAdminPanelRecord,
  SecurityPrivacyRecord,
  SchoolAdminSettingRecord,
  SchoolAdminTemplateRecord
} from './types.ts'

function stat(label: string, value: string, detail: string): QuickStatView {
  return { label, value, detail }
}

function action(id: string, title: string, detail: string, ctaLabel: string): SchoolAdminActionRecord {
  return { id, title, detail, ctaLabel }
}

function event(id: string, title: string, startsAt: string, location: string, audience: string, detail: string): SchoolAdminEventRecord {
  return { id, title, startsAt, location, audience, detail }
}

function entity(id: string, title: string, subtitle: string, detail: string, status: string, meta: string): SchoolAdminEntityRecord {
  return { id, title, subtitle, detail, status, meta }
}

function classRecord(id: string, classLabel: string, homeroomTeacher: string, studentCount: number, attendanceRate: string, transferRequests: number): SchoolAdminClassRecord {
  return { id, classLabel, homeroomTeacher, studentCount, attendanceRate, transferRequests }
}

function exportItem(id: string, label: string, format: SchoolAdminExportRecord['format'], detail: string): SchoolAdminExportRecord {
  return { id, label, format, detail }
}

function forecast(id: string, label: string, amountMad: number, detail: string, confidence: SchoolAdminForecastRecord['confidence']): SchoolAdminForecastRecord {
  return { id, label, amountMad, detail, confidence }
}

function template(id: string, title: string, channel: SchoolAdminTemplateRecord['channel'], audience: string, lastUsedAt: string): SchoolAdminTemplateRecord {
  return { id, title, channel, audience, lastUsedAt }
}

function setting(id: string, title: string, detail: string, status: string): SchoolAdminSettingRecord {
  return { id, title, detail, status }
}

function security(id: string, title: string, detail: string, status: string, meta: string): SecurityPrivacyRecord {
  return { id, title, detail, status, meta }
}

const summitAdminPanel: SchoolAdminPanelRecord = {
  dashboard: {
    heroStats: [
      stat('Total students', '612', 'Across early years, primary, and middle school'),
      stat('Active parents', '428', '91% logged in during the last 7 days'),
      stat('Collection rate', '94%', 'Above target for the current billing cycle'),
      stat('Open complaints', '7', '2 urgent and 5 in active follow-up'),
      stat('Today attendance', '96.8%', '19 late arrivals and 7 absences logged'),
      stat('Parent NPS', '+63', '146 satisfaction responses this month')
    ],
    revenueThisMonthMad: 684000,
    revenueLastMonthMad: 621000,
    revenueDeltaLabel: '+10.1% vs last month',
    upcomingEvents: [
      event('admin-event-1', 'Parent-teacher conferences', '2026-03-27T14:00:00+01:00', 'Main conference wing', 'All primary families', 'Meeting slots are 86% booked and teacher schedules are locked.'),
      event('admin-event-2', 'Spring arts night', '2026-03-28T17:30:00+01:00', 'Innovation hall', 'Whole school', 'Stage, volunteer desk, and ticketing queue still need final confirmation.'),
      event('admin-event-3', 'Grade 1 admissions assessment', '2026-04-02T08:30:00+01:00', 'Admissions suite', 'Prospective families', '32 candidates are scheduled and evaluator packs are ready.')
    ],
    quickActions: [
      action('admin-action-1', 'Add student', 'Create a new record, assign class, and issue document checklist.', 'Start admission'),
      action('admin-action-2', 'Generate invoices', 'Run this month billing in bulk for active fee plans.', 'Open billing run'),
      action('admin-action-3', 'Send announcement', 'Broadcast one message to all parents, a class, or one family.', 'Draft message'),
      action('admin-action-4', 'Review complaints', 'Triage urgent complaints and escalate anything nearing SLA.', 'Open queue')
    ]
  },
  studentManagement: {
    stats: [
      stat('New this month', '18', 'New student records created since March 1'),
      stat('Transfers pending', '6', 'Awaiting class seat confirmation'),
      stat('Archived records', '14', 'Graduated or inactive student profiles'),
      stat('Import accuracy', '99.2%', 'Last CSV upload completed with two soft warnings')
    ],
    classes: [
      classRecord('admin-class-1', 'Cedar Class', 'Ms. Zohra Benkirane', 27, '97%', 1),
      classRecord('admin-class-2', 'Olive Class', 'Mr. Mehdi Alaoui', 24, '98%', 0),
      classRecord('admin-class-3', 'Atlas Class', 'Ms. Ghita El Fassi', 29, '95%', 3)
    ],
    students: [
      entity('admin-student-1', 'Lina Bennani', 'Grade 4 · Cedar Class', 'Academic profile, allergy flag, and activity plan are all up to date.', 'Healthy profile', 'Documents complete'),
      entity('admin-student-2', 'Adam Bennani', 'Year 2 · Maple Class', 'Transfer between campuses is waiting on final class assignment.', 'Transfer in progress', '2 approvals pending'),
      entity('admin-student-3', 'Sara Tazi', 'Grade 1 · Olive Class', 'Birth certificate and immunization card still need to be uploaded to the vault.', 'Needs documents', 'Vault missing 2 files')
    ],
    imports: [
      entity('admin-import-1', 'Grade 1 admissions CSV', 'Bulk import', '32 records parsed, 30 imported, 2 soft warnings for duplicate guardian email.', 'Ready to review', 'Uploaded 09:10'),
      entity('admin-import-2', 'Scholarship roster update', 'Excel sync', 'Fee discount columns matched correctly and archive flags were preserved.', 'Completed', 'Uploaded yesterday')
    ],
    documents: [
      entity('admin-doc-1', 'Missing student vault items', '8 records', 'Birth certificate, vaccine card, or signed contract missing on one or more active students.', 'Action required', 'Deadline Friday'),
      entity('admin-doc-2', 'Archive retention batch', 'Policy control', '14 archived student files are ready for the retention review workflow.', 'Scheduled', 'Review in 5 days')
    ]
  },
  parentManagement: {
    stats: [
      stat('Linked households', '401', 'Parents currently linked to at least one active child'),
      stat('Inactive accounts', '23', 'No login activity in the last 45 days'),
      stat('Access codes pending', '11', 'Families waiting for first activation'),
      stat('Response time', '2h 14m', 'Median response time across direct communication')
    ],
    parents: [
      entity('admin-parent-1', 'Amira Bennani family', '3 linked children · 2 schools', 'Engagement is strong with recent approvals, event RSVP activity, and weekly logins.', 'Highly engaged', 'Last active today'),
      entity('admin-parent-2', 'Nora Alaoui family', 'No child linked yet', 'Invite accepted but child record still needs linking from admissions.', 'Needs linking', 'Onboarding open'),
      entity('admin-parent-3', 'Karim Touzani family', '1 linked child', 'Communication history shows repeated billing follow-up without response.', 'Watchlist', '3 unanswered reminders')
    ],
    access: [
      entity('admin-access-1', 'QR invites to issue', '7 new families', 'Generate QR cards and one-time access codes before the orientation meeting.', 'Queued', 'Orientation Thursday'),
      entity('admin-access-2', 'Reactivation requests', '4 parents', 'Parents asked to restore blocked or expired access after identity verification.', 'Review', 'Needs admin approval')
    ],
    communications: [
      entity('admin-comm-1', 'High-touch families', 'Service review', '12 households account for most direct contact volume this month.', 'Monitor', 'Conversation history attached'),
      entity('admin-comm-2', 'Conference follow-up', 'Bulk communication', 'Parents who have not booked conference slots should receive a reminder by tomorrow noon.', 'Scheduled', 'Audience 43 families')
    ],
    controls: [
      entity('admin-control-1', 'Dormant accounts', 'Block or deactivate', 'Accounts with repeated failed logins and no child link are ready for deactivation review.', 'Pending decision', '9 candidates'),
      entity('admin-control-2', 'Shared account audit', 'Permissions check', 'Two households still use a shared guardian login that should be split by role.', 'Needs cleanup', 'Risk medium')
    ]
  },
  teacherManagement: {
    stats: [
      stat('Active teachers', '54', 'Including homeroom, subject, and specialist teachers'),
      stat('Classes covered', '28', 'Every class has at least one primary owner'),
      stat('Performance reviews', '12 due', 'Quarterly reviews scheduled for next week'),
      stat('App access enabled', '51', 'Three teacher accounts still waiting for activation')
    ],
    teachers: [
      entity('admin-teacher-1', 'Amine Jalal', 'Science and robotics', 'Performance metrics are trending up with high assignment completion and strong parent feedback.', 'Top performer', '5 classes assigned'),
      entity('admin-teacher-2', 'Zohra Benkirane', 'Primary homeroom', 'Classroom coverage is stable and conference booking demand is high.', 'Fully booked', 'Cedar Class owner'),
      entity('admin-teacher-3', 'Salma Rahali', 'French language', 'Teacher app access is provisioned but timetable changes still need confirmation.', 'Needs schedule lock', '2 timetable edits open')
    ],
    timetables: [
      entity('admin-timetable-1', 'Grade 6 science lab shift', 'Timetable management', 'Lab room conflict on Wednesday requires one session to move by 30 minutes.', 'Conflict', 'Owner: operations'),
      entity('admin-timetable-2', 'Teacher app rollout', 'Access control', 'Three newly hired teachers still need app access and class assignment mapping.', 'Pending', 'Owner: HR admin')
    ]
  },
  financialManagement: {
    stats: [
      stat('Invoices this month', '612', 'Individual and bulk runs both completed'),
      stat('Outstanding balance', 'MAD 118,000', 'Across 37 active family accounts'),
      stat('Auto-reminders live', '3 rules', 'Weekly nudges for upcoming, overdue, and contract-linked fees'),
      stat('Forecast confidence', 'High', 'Cash flow projection is stable through June')
    ],
    outstanding: [
      entity('admin-finance-1', 'March tuition follow-up', '37 families', 'Outstanding invoices are clustered in Grade 1 and middle school renewal cohorts.', 'Open', 'MAD 118,000 due'),
      entity('admin-finance-2', 'Scholarship approval credits', '8 accounts', 'Credit notes must be applied before the next invoice generation run.', 'Needs action', 'Before Mar 25')
    ],
    reminders: [
      entity('admin-reminder-1', 'Upcoming due-date reminder', 'Auto reminder', 'Send 48 hours before due date to families with card autopay disabled.', 'Enabled', 'Rule 01'),
      entity('admin-reminder-2', 'Overdue escalation reminder', 'Finance escalation', 'Escalate to parent success team after 7 unpaid days and two failed nudges.', 'Enabled', 'Rule 02')
    ],
    exports: [
      exportItem('admin-export-1', 'Daily revenue workbook', 'excel', 'Detailed payment lines grouped by channel and fee family.'),
      exportItem('admin-export-2', 'Monthly finance pack', 'pdf', 'Board-ready finance summary with collections, overdue aging, and forecast.'),
      exportItem('admin-export-3', 'Accounting handoff', 'csv', 'Structured transaction export for external accounting software.')
    ],
    forecast: [
      forecast('admin-forecast-1', 'April expected collection', 702000, 'Projected from active fee plans and reminder recovery trend.', 'high'),
      forecast('admin-forecast-2', 'May conservative scenario', 668000, 'Includes a delayed-payment assumption on 11 watchlist families.', 'medium'),
      forecast('admin-forecast-3', 'Risk buffer', 42000, 'Recommended reserve to absorb late renewals and scholarship adjustments.', 'watch')
    ]
  },
  communicationCenter: {
    stats: [
      stat('Announcements this week', '9', 'Across whole-school, class, and targeted audiences'),
      stat('Approval requests', '14', 'Pending school-side validation or reminder'),
      stat('Open conversations', '63', 'Direct parent threads still active'),
      stat('Scheduled messages', '5', 'Ready to publish over the next 72 hours')
    ],
    announcements: [
      entity('admin-announcement-1', 'Spring arts night update', 'Whole school', 'Dress code, arrival gates, and volunteer desk instructions are ready to send.', 'Draft ready', 'Send today 16:00'),
      entity('admin-announcement-2', 'Grade 4 trip reminder', 'Cedar Class', 'Final permission reminder for the museum outing needs one last proofread.', 'Pending approval', 'Audience 27 families')
    ],
    approvals: [
      entity('admin-approval-1', 'Museum visit consent', 'Approval requests', 'Five families still need to sign before the bus manifest is locked.', 'Awaiting signatures', 'Deadline tomorrow'),
      entity('admin-approval-2', 'Photo consent refresh', 'Annual approvals', 'Bulk reminder should go to parents whose media consent expires this month.', 'Queued', '112 families')
    ],
    templates: [
      template('admin-template-1', 'Overdue payment reminder', 'email', 'Families with unpaid invoices', '2026-03-18T10:00:00+01:00'),
      template('admin-template-2', 'Conference booking nudge', 'push', 'Parents without meeting slot', '2026-03-19T09:20:00+01:00'),
      template('admin-template-3', 'Absence follow-up', 'whatsapp', 'Individual family outreach', '2026-03-17T13:40:00+01:00')
    ],
    scheduled: [
      entity('admin-scheduled-1', 'Conference reminder wave', 'Scheduled message', 'Publish tomorrow morning to 43 unbooked families with direct booking link.', 'Scheduled', 'Mar 21 08:30'),
      entity('admin-scheduled-2', 'Invoice release confirmation', 'Scheduled message', 'Notify families once the next bulk invoice generation run finishes.', 'Scheduled', 'Mar 24 12:00')
    ]
  },
  reports: {
    stats: [
      stat('Academic report packs', '6', 'Prepared for leadership and department review'),
      stat('Attendance exports', '3', 'Weekly, monthly, and class-level attendance snapshots'),
      stat('Complaint insights', '1 board pack', 'Trend analysis with service breakdown and SLA compliance'),
      stat('Custom builder blocks', '8', 'Reusable data blocks available for ad hoc reporting')
    ],
    exports: [
      exportItem('admin-report-1', 'Academic performance report', 'excel', 'Subject performance by class, teacher, and grade band.'),
      exportItem('admin-report-2', 'Attendance compliance report', 'pdf', 'Daily and monthly attendance with late-arrival drill-down.'),
      exportItem('admin-report-3', 'Parent engagement report', 'excel', 'Login activity, approvals, RSVP, and message response patterns.'),
      exportItem('admin-report-4', 'Complaint analysis pack', 'pdf', 'Complaint category mix, resolution times, and satisfaction trend.')
    ],
    highlights: [
      'Science and language performance both improved in Grade 4 this month.',
      'Late-arrival rate dropped after adjusting gate arrival windows for early years.',
      'Complaint volume is flat month over month, but billing-related complaints rose slightly.',
      'Parents who receive push reminders convert faster on conference bookings than email-only cohorts.'
    ],
    builderBlocks: ['Academic performance', 'Attendance', 'Finance', 'Parent engagement', 'Complaints', 'Student lifecycle', 'Teacher performance', 'Events']
  },
  settings: {
    stats: [
      stat('Profile updates', '2 pending', 'Branding and school page edits waiting for approval'),
      stat('Notification rules', '7 active', 'Attendance, billing, approvals, and event reminders'),
      stat('Role policies', '11', 'Permissions split across admin, finance, admissions, and leadership'),
      stat('Integrations', '4 connected', 'Calendar, accounting export, SMS, and push provider')
    ],
    items: [
      setting('admin-setting-1', 'School profile customization', 'Logo, colors, welcome video, and school page content are editable from one place.', 'Ready'),
      setting('admin-setting-2', 'Notification rules', 'Configure billing nudges, attendance alerts, and approval reminders by audience and channel.', 'Active'),
      setting('admin-setting-3', 'Fee structure configuration', 'Core tuition, transport, meals, and discounts are versioned by academic year.', 'Locked for current term'),
      setting('admin-setting-4', 'Academic year setup', 'Terms, holidays, exams, and conference windows are configured for the active calendar.', 'Ready'),
      setting('admin-setting-5', 'Grading system configuration', 'Grade scales and reporting bands are aligned to school policy.', 'Reviewed'),
      setting('admin-setting-6', 'User roles and permissions', 'Admissions, finance, teachers, and leadership each have a scoped permission set.', 'Audit due'),
      setting('admin-setting-7', 'Integration settings', 'Calendar sync, accounting export, and messaging providers are connected and healthy.', 'Healthy')
    ]
  },
  securityPrivacy: {
    stats: [
      stat('2FA coverage', '92%', 'Admin, finance, and supervisor roles enrolled in enforced two-factor access'),
      stat('Audit events today', '18,204', 'Every sign-in, export, approval, and settings change is tracked'),
      stat('Backup success', '100%', 'Nightly encrypted backups completed at 02:00 with restore checks'),
      stat('Open privacy requests', '3', 'Deletion or consent requests waiting for school-side confirmation')
    ],
    controls: [
      security('admin-security-1', 'End-to-end encryption', 'Sensitive parent messaging threads and signed documents are protected in transit and encrypted at rest in the document vault.', 'Enabled', 'Message vault and contracts covered'),
      security('admin-security-2', 'Two-factor authentication', 'School leadership, finance, and support roles must confirm access with a second factor before entering operational screens.', 'Enforced', '92% enrolled, 8 accounts pending'),
      security('admin-security-3', 'Session management and auto-logout', 'Idle sessions close automatically after 15 minutes, while device trust and session revocation remain visible to admins.', 'Active', 'Policy matches current timeout rules'),
      security('admin-security-4', 'Role-based access control', 'Admissions, finance, teaching, transport, and leadership permissions are split so users only see the workflows they own.', 'Reviewed', '11 scoped policies live')
    ],
    compliance: [
      security('admin-compliance-1', 'GDPR and Loi 09-08 readiness', 'Consent notices, access logs, and retention rules are versioned so the school can demonstrate lawful processing when audited.', 'Compliant', 'Next review Apr 2026'),
      security('admin-compliance-2', 'Parental consent management', 'Media, analytics, medical, and trip consent states are stored per child and can be refreshed from the parent workspace.', 'Live', '401 households with current records'),
      security('admin-compliance-3', 'Right to deletion workflow', 'Parents can request data removal, trigger a legal hold review, and receive a documented completion update within the service SLA.', 'Ready', '30-day resolution path'),
      security('admin-compliance-4', 'Analytics anonymization', 'Student-facing analytics exports remove personal identifiers before leadership dashboards or board reports are generated.', 'Enabled', 'Applied to 8 report blocks')
    ],
    resilience: [
      security('admin-resilience-1', 'Full audit log', 'Every action from login to document download is written to the audit ledger with actor, timestamp, and affected record.', 'Streaming', '18,204 events captured today'),
      security('admin-resilience-2', 'Automated daily backups', 'Encrypted backups run nightly with retention, checksum validation, and a weekly restore simulation for core records.', 'Healthy', '35-day retention window'),
      security('admin-resilience-3', 'Data residency and SSL/TLS', 'Primary hosting stays in Morocco with EU failover, and all school traffic is forced through HTTPS with modern TLS.', 'Protected', 'Morocco primary, EU standby'),
      security('admin-resilience-4', 'Annual penetration testing', 'External penetration testing is scheduled each year, with findings tracked into owner remediation and school communication plans.', 'Scheduled', 'Next test Sep 2026')
    ]
  }
}

export const schoolAdminPanelsById: Record<string, SchoolAdminPanelRecord> = {
  [schoolBrand.id]: summitAdminPanel
}

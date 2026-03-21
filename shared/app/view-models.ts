import { quickActionModules, ROLE_LABELS, platformBrand, schoolBrand } from './data.ts'
import { childActivitiesById } from './activities.ts'
import { childApprovalsById } from './approvals.ts'
import { childComplaintsById } from './complaints.ts'
import { childContractsById } from './contracts.ts'
import { childFinanceById } from './finance.ts'
import { childMessagesById } from './messages.ts'
import { superAdminPanelById } from './super-admin.ts'
import { schoolAdminPanelsById } from './school-admin.ts'
import { schoolProfilesById } from './school-profile.ts'
import { childSchoolLifeById } from './school-life.ts'
import { childTransportById } from './transport.ts'
import { listDevicesForAccount } from './session.ts'
import type {
  AcademicAttendanceBadgeView,
  AcademicCalendarLinkView,
  AcademicGradeChartPointView,
  AcademicHomeworkCalendarDayView,
  AcademicHomeworkCalendarItemView,
  AcademicHomeworkRecord,
  AcademicScheduleDayView,
  ActivityBookingRecord,
  ApprovalReminderRecord,
  ApprovalRequestRecord,
  ApprovalSignatureLogRecord,
  ChildRecord,
  ComplaintCategory,
  ComplaintModuleRecord,
  CommunicationAnnouncementRecord,
  CommunicationAppointmentRecord,
  CommunicationConversationRecord,
  ContractSignatureLogRecord,
  FinancialRequestRecord,
  ParentAcademicsView,
  ParentAccount,
  ParentActivitiesView,
  ParentApprovalsView,
  ParentComplaintsView,
  ParentContractsView,
  ParentDashboardView,
  ParentFinancialView,
  ParentMessagesView,
  SchoolAdminPanelView,
  SuperAdminPanelView,
  ParentSchoolLifeView,
  ParentSchoolProfileView,
  SchoolProfileRecord,
  ParentTransportView,
  RoleWorkspaceView,
  SatisfactionSurveyAggregateView,
  SatisfactionSurveySubmissionRecord,
  SeedUser,
  TransportPickupLogRecord,
  TransportRequestRecord,
  TransportRouteStopRecord,
  ViewDevice,
  WorkspaceSummary
} from './types.ts'

function placeholder(label: string) {
  return { value: 'Unavailable', detail: label }
}

function formatDevice<T extends { lastActiveAt: string }>(device: T): T & { lastActiveLabel: string } {
  return {
    ...device,
    lastActiveLabel: new Date(device.lastActiveAt).toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function initialsFromName(name: string) {
  return String(name ?? '').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function behaviorSummary(rating = 0) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
  return `${safeRating}/5`
}

function transportToneLabel(transport: { tone?: string | null } | null | undefined) {
  if (!transport?.tone) return 'Status pending'
  if (transport.tone === 'live') return 'Live tracking'
  if (transport.tone === 'confirmed') return 'Confirmed'
  return 'Awaiting assignment'
}

function formatTimeRange(startsAt: string, endsAt: string) {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const start = new Date(startsAt).toLocaleTimeString('en-GB', options)
  const end = new Date(endsAt).toLocaleTimeString('en-GB', options)
  return `${start}-${end}`
}

function formatTimestampLabel(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatScore(score: number) {
  return `${score.toFixed(1)}/20`
}

function buildChartHeight(score: number) {
  return Math.max(18, Math.min(100, Math.round((score / 20) * 100)))
}

function formatMad(amount: number) {
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

function toCalendarTimestamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/u, 'Z')
}

function escapeIcsText(value: string) {
  return String(value).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function buildGoogleEventLink(title: string, startsAt: string, endsAt: string, details: string) {
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toCalendarTimestamp(startsAt)}/${toCalendarTimestamp(endsAt)}`,
    details
  })
  return `https://calendar.google.com/calendar/render?${query.toString()}`
}

function buildIcsDataUrl(name: string, events: Array<{ title: string; startsAt: string; endsAt: string; details: string }>) {
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School OS//Academics//EN',
    ...events.flatMap((event, index) => [
      'BEGIN:VEVENT',
      `UID:${index + 1}-${event.title.replace(/\s+/g, '-').toLowerCase()}@schoolos.test`,
      `DTSTAMP:${toCalendarTimestamp(event.startsAt)}`,
      `DTSTART:${toCalendarTimestamp(event.startsAt)}`,
      `DTEND:${toCalendarTimestamp(event.endsAt)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.details)}`,
      'END:VEVENT'
    ]),
    'END:VCALENDAR'
  ].join('\r\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`
}

function groupScheduleDays(child: ChildRecord | null): AcademicScheduleDayView[] {
  const entries = child?.academics?.scheduleEntries ?? []
  const grouped = new Map<string, AcademicScheduleDayView>()

  for (const entry of entries) {
    const existing = grouped.get(entry.dayId)
    if (existing) {
      existing.entries.push(entry)
      existing.hasExam = existing.hasExam || Boolean(entry.isExamDay)
      continue
    }

    grouped.set(entry.dayId, {
      dayId: entry.dayId,
      dayLabel: entry.dayLabel,
      dateLabel: entry.dateLabel,
      hasExam: Boolean(entry.isExamDay),
      entries: [entry]
    })
  }

  return Array.from(grouped.values())
}

function buildCalendarLinks(child: ChildRecord | null): AcademicCalendarLinkView[] {
  const academics = child?.academics
  if (!child || !academics) return []

  const focusExam = academics.exams.find((item) => !item.result) ?? academics.exams[0]
  const focusEntry = academics.scheduleEntries[0]
  const googleSource = focusExam
    ? {
        title: `${child.fullName} · ${focusExam.subject}`,
        startsAt: focusExam.startsAt,
        endsAt: focusExam.endsAt,
        details: `${child.school.name} · ${focusExam.room} · ${focusExam.syllabus.join(', ')}`
      }
    : focusEntry
      ? {
          title: `${child.fullName} · ${focusEntry.subject}`,
          startsAt: focusEntry.startsAt,
          endsAt: focusEntry.endsAt,
          details: `${child.school.name} · ${focusEntry.room} · ${focusEntry.teacher}`
        }
      : null

  const icsEvents = [
    ...academics.scheduleEntries.map((entry) => ({
      title: `${child.fullName} · ${entry.subject}`,
      startsAt: entry.startsAt,
      endsAt: entry.endsAt,
      details: `${entry.teacher} · ${entry.room}${entry.note ? ` · ${entry.note}` : ''}`
    })),
    ...academics.exams.map((exam) => ({
      title: `${child.fullName} · ${exam.subject}`,
      startsAt: exam.startsAt,
      endsAt: exam.endsAt,
      details: `${exam.room} · ${exam.syllabus.join(', ')}`
    }))
  ]

  const links: AcademicCalendarLinkView[] = []
  if (googleSource) {
    links.push({ label: 'Google Calendar', href: buildGoogleEventLink(googleSource.title, googleSource.startsAt, googleSource.endsAt, googleSource.details), kind: 'google' })
  }
  if (icsEvents.length > 0) {
    links.push({ label: 'Apple Calendar (.ics)', href: buildIcsDataUrl(`${child.fullName} academics`, icsEvents), kind: 'apple' })
  }
  return links
}

function buildGradeChart(child: ChildRecord | null): AcademicGradeChartPointView[] {
  return (child?.academics?.gradePoints ?? []).map((point) => ({
    label: point.label,
    score: point.score,
    scoreLabel: formatScore(point.score),
    scoreHeight: buildChartHeight(point.score),
    classAverage: point.classAverage,
    classAverageLabel: formatScore(point.classAverage),
    classAverageHeight: buildChartHeight(point.classAverage)
  }))
}

function buildAttendanceBadge(status: 'present' | 'absent' | 'late' | undefined): AcademicAttendanceBadgeView {
  if (status === 'absent') {
    return { label: 'Absent today', tone: 'danger' }
  }
  if (status === 'late') {
    return { label: 'Late today', tone: 'warning' }
  }
  if (status === 'present') {
    return { label: 'Present today', tone: 'success' }
  }
  return { label: 'Attendance pending', tone: 'neutral' }
}

function summarizeHomework(items: AcademicHomeworkRecord[]) {
  return {
    submitted: items.filter((item) => item.status === 'submitted').length,
    pending: items.filter((item) => item.status === 'pending').length,
    late: items.filter((item) => item.status === 'late').length
  }
}

function buildHomeworkCalendar(items: AcademicHomeworkRecord[]): AcademicHomeworkCalendarDayView[] {
  const grouped = new Map<string, AcademicHomeworkCalendarItemView[]>()

  for (const item of items) {
    const date = new Date(item.dueAt)
    if (Number.isNaN(date.getTime())) continue
    const dayKey = date.toISOString().slice(0, 10)
    const existing = grouped.get(dayKey) ?? []
    existing.push({
      id: item.id,
      title: item.title,
      subject: item.subject,
      dueAt: item.dueAt,
      status: item.status
    })
    grouped.set(dayKey, existing)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dayKey, dayItems]) => ({
      dayKey,
      dayLabel: new Date(`${dayKey}T08:00:00`).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      items: dayItems.sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())
    }))
}

export function buildParentDashboardView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentDashboardView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const summary = parent?.dashboardSummary
  const children = parent?.children ?? []
  const complaints = parent?.complaints ?? []
  const recentUpdates = parent?.recentUpdates ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    greeting: summary?.latestStatus ?? 'Your school updates will appear here as soon as the first records arrive.',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    quickStats: activeChild
      ? [
          { label: 'Average', value: activeChild.averageScore ?? placeholder('Average pending').value, detail: activeChild.averageLabel ?? 'Latest academic average' },
          { label: 'Attendance', value: activeChild.attendanceRate ?? placeholder('Attendance sync pending').value, detail: activeChild.attendanceSummary ?? 'Monthly attendance status' },
          { label: 'Behavior', value: behaviorSummary(activeChild.behaviorRating ?? 0), detail: activeChild.behaviorLabel ?? 'Behavior insights will appear here' }
        ]
      : [
          { label: 'Average', value: placeholder('Academic data pending').value, detail: 'No linked child yet' },
          { label: 'Attendance', value: placeholder('Attendance sync pending').value, detail: 'No linked child yet' },
          { label: 'Behavior', value: placeholder('Behavior insights pending').value, detail: 'No linked child yet' }
        ],
    alerts: activeChild?.alerts?.length ? activeChild.alerts : [{ id: 'alerts-empty', tone: 'calm', title: 'No urgent actions right now', detail: 'School alerts and required actions will appear here when they need attention.' }],
    schedule: activeChild?.schedule ?? [],
    transport: activeChild ? { status: activeChild.transport?.status ?? 'Transport details pending', detail: activeChild.transport?.detail ?? 'The school will publish route updates soon.', toneLabel: transportToneLabel(activeChild.transport) } : { status: 'No transport data available', detail: 'Link a child profile to start receiving route information.', toneLabel: 'Pending' },
    latestNews: activeChild?.news ?? recentUpdates[0]?.title ?? 'School news will appear here once the first update is published.',
    achievement: activeChild?.achievement ?? activeChild?.latestHighlight ?? 'Achievements and milestones will appear here once available.',
    complaintState: complaints.length ? { empty: false, title: 'Current issues', description: 'Open items are tracked here until the school closes them.', items: complaints } : { empty: true, title: 'No current issues', description: 'There are no active complaints or reclamations at the moment.', items: [] },
    recentUpdates: recentUpdates.length ? recentUpdates : [{ id: 'update-empty', title: 'No notices yet', body: 'New communications from the school will appear here once shared.' }],
    quickActions: quickActionModules,
    summaryStrip: { fees: summary?.fees?.dueLabel ?? summary?.fees?.paidLabel ?? 'Finance details pending', events: `${summary?.upcomingEvents ?? 0} upcoming activities`, transport: summary?.transportStatus ?? 'Transport details pending' }
  }
}

export function buildParentAcademicsView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentAcademicsView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const academics = activeChild?.academics ?? null
  const scheduleDays = groupScheduleDays(activeChild)
  const homeworkItems = academics?.homework ?? []
  const homeworkSummary = summarizeHomework(homeworkItems)
  const firstScheduleEntry = scheduleDays[0]?.entries[0] ?? null
  const firstAttendanceStat = academics?.attendance.stats[0]

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && academics
      ? [
          { label: 'Next class', value: firstScheduleEntry ? `${firstScheduleEntry.subject} ${formatTimeRange(firstScheduleEntry.startsAt, firstScheduleEntry.endsAt)}` : 'No class scheduled', detail: firstScheduleEntry ? `${firstScheduleEntry.dayLabel} ${firstScheduleEntry.dateLabel} · ${firstScheduleEntry.room}` : 'The next timetable update will appear here.' },
          { label: 'Average', value: academics.overallAverage, detail: `Class average ${academics.classAverage}` },
          { label: 'Homework', value: `${homeworkSummary.pending + homeworkSummary.late} open`, detail: `${homeworkSummary.submitted} submitted · ${homeworkSummary.late} late` },
          { label: 'Attendance', value: firstAttendanceStat?.value ?? (activeChild.attendanceRate ?? 'Unavailable'), detail: academics.attendance.todayDetail }
        ]
      : [
          { label: 'Next class', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Average', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Homework', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Attendance', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    schedule: {
      days: scheduleDays,
      updates: academics?.scheduleUpdates?.length ? academics.scheduleUpdates : [{ id: 'academics-update-empty', tone: 'calm', title: 'No live timetable changes', detail: 'Any teacher, room, or timing update will be surfaced here immediately.', effectiveAt: 'Waiting for updates' }],
      calendarLinks: buildCalendarLinks(activeChild),
      examDayLabels: Array.from(new Set(scheduleDays.filter((day) => day.hasExam).map((day) => `${day.dayLabel} ${day.dateLabel}`)))
    },
    grades: {
      overallAverage: academics?.overallAverage ?? 'Unavailable',
      classAverage: academics?.classAverage ?? 'Unavailable',
      yearComparison: academics?.yearComparison ?? 'Year-over-year comparison will appear once records are available.',
      rankingEnabled: academics?.rankingEnabled ?? false,
      reportCard: academics?.reportCard ? { ...academics.reportCard, downloadUrl: `/api/parent/report-card?child=${encodeURIComponent(activeChild?.id ?? '')}&term=${encodeURIComponent(academics.reportCard.termId)}` } : null,
      chart: buildGradeChart(activeChild),
      subjects: academics?.subjectGrades ?? []
    },
    homework: {
      items: homeworkItems,
      summary: homeworkSummary,
      parentAlerts: homeworkItems.map((item) => item.parentNotification).filter((value): value is string => Boolean(value)),
      calendarDays: buildHomeworkCalendar(homeworkItems)
    },
    exams: {
      items: academics?.exams ?? [],
      nextReminder: academics?.exams.find((item) => !item.result)?.reminderDate ?? 'No exam reminders scheduled'
    },
    attendance: {
      badge: buildAttendanceBadge(academics?.attendance.todayStatus),
      detail: academics?.attendance.todayDetail ?? 'Attendance status will appear here once a linked student record is available.',
      notification: academics?.attendance.notification ?? 'Attendance notifications will be activated after student records are linked.',
      stats: academics?.attendance.stats ?? [],
      history: academics?.attendance.history ?? [],
      impact: academics?.attendance.impact ?? 'No attendance impact configuration is active yet.',
      absenceGuidance: academics?.attendance.absenceGuidance ?? 'Absence reasons can be submitted directly in the app once attendance tracking is enabled.'
    }
  }
}

function sortRequestsNewestFirst(items: FinancialRequestRecord[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

export function buildParentFinancialView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentFinancialView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const finance = activeChild ? childFinanceById[activeChild.id] ?? null : null

  const feeItems = finance?.feeItems ?? []
  const totalThisYear = feeItems.reduce((sum, item) => sum + item.thisYearAmountMad, 0)
  const totalLastYear = feeItems.reduce((sum, item) => sum + item.lastYearAmountMad, 0)
  const includedCount = feeItems.filter((item) => item.included).length
  const extraCount = feeItems.filter((item) => !item.included).length
  const yearDelta = totalThisYear - totalLastYear

  const trackingMonthly = finance?.monthlyStatus ?? []
  const trackingHistory = finance?.paymentHistory ?? []
  const totalPaidThisYear = trackingHistory.filter((item) => item.status === 'confirmed').reduce((sum, item) => sum + item.amountMad, 0)
  const totalDueThisYear = trackingMonthly.reduce((sum, item) => sum + item.amountDueMad, 0)
  const totalOutstanding = Math.max(0, totalDueThisYear - totalPaidThisYear)
  const nextPending = trackingMonthly.find((item) => item.status === 'pending')
  const overdueCount = trackingMonthly.filter((item) => item.status === 'overdue').length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && finance
      ? [
          { label: 'Total paid this year', value: formatMad(totalPaidThisYear), detail: `${trackingHistory.filter((item) => item.status === 'confirmed').length} confirmed payments` },
          { label: 'Outstanding balance', value: formatMad(totalOutstanding), detail: overdueCount > 0 ? `${overdueCount} overdue month${overdueCount > 1 ? 's' : ''}` : 'No overdue months' },
          { label: 'Next due date', value: nextPending?.dueDateLabel ?? 'No pending due date', detail: nextPending ? `${nextPending.monthLabel} · ${formatMad(nextPending.amountDueMad)}` : 'All configured months are paid' },
          { label: 'Fee change vs last year', value: `${yearDelta >= 0 ? '+' : ''}${formatMad(yearDelta)}`, detail: `Current total ${formatMad(totalThisYear)} vs ${formatMad(totalLastYear)} last year` }
        ]
      : [
          { label: 'Total paid this year', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Outstanding balance', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Next due date', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Fee change vs last year', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    fees: {
      items: feeItems,
      includedCount,
      extraCount,
      totalThisYearMad: totalThisYear,
      totalLastYearMad: totalLastYear,
      yearOverYearLabel: `${yearDelta >= 0 ? 'Increase' : 'Decrease'} of ${formatMad(Math.abs(yearDelta))} compared with last school year.`,
      faq: finance?.feeFaq ?? []
    },
    paymentTracking: {
      monthlyStatus: trackingMonthly,
      history: trackingHistory,
      reminders: finance?.reminders ?? [],
      lateNotices: finance?.lateNotices ?? [],
      totalPaidThisYearMad: totalPaidThisYear,
      totalOutstandingMad: totalOutstanding
    },
    onlinePayment: {
      gateways: finance?.gateways ?? [],
      installmentOptions: finance?.installmentOptions ?? [],
      partialPaymentMinMad: finance?.partialPaymentMinMad ?? 0,
      recurringEnabled: finance?.recurringEnabled ?? false,
      securityComplianceNote: finance?.securityComplianceNote ?? 'Secure payment options will appear once enabled by the school.'
    },
    requests: {
      items: sortRequestsNewestFirst(finance?.requests ?? [])
    },
    taxDocuments: {
      items: finance?.taxDocuments ?? [],
      autoGenerationNote: finance?.autoGenerationNote ?? 'Tax documents will be generated once yearly billing closes.'
    }
  }
}

function sortSignaturesNewestFirst(items: ContractSignatureLogRecord[]) {
  return [...items].sort((left, right) => new Date(right.signedAt).getTime() - new Date(left.signedAt).getTime())
}

export function buildParentContractsView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentContractsView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const contracts = activeChild ? childContractsById[activeChild.id] ?? null : null

  const current = contracts?.current ?? null
  const signatureLog = sortSignaturesNewestFirst(contracts?.signatureLog ?? [])
  const signerStatuses = (contracts?.signers ?? []).map((item) => {
    const signed = signatureLog.find((entry) => entry.roleId === item.roleId)
    return {
      ...item,
      status: signed ? 'signed' as const : 'pending' as const,
      signedAt: signed?.signedAt ?? null,
      ipAddress: signed?.ipAddress ?? null
    }
  })
  const signedCount = signerStatuses.filter((item) => item.status === 'signed').length
  const renewalDate = current?.renewalDate ? new Date(current.renewalDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unavailable'
  const historyItems = [...(contracts?.history ?? [])].sort((left, right) => new Date(right.signedAt).getTime() - new Date(left.signedAt).getTime())
  const amendmentCount = historyItems.filter((item) => item.kind === 'amendment').length
  const alerts = [...(contracts?.alerts ?? [])].sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())
  const nextAlert = alerts[0]
  const reEnrollment = contracts?.reEnrollment ?? null

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && contracts
      ? [
          { label: 'Current contract', value: current?.contractRef ?? 'Unavailable', detail: current ? `${current.title} · ${current.status.replace('_', ' ')}` : 'No active contract found' },
          { label: 'Renewal deadline', value: renewalDate, detail: current ? `Contract ends ${new Date(current.endsAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No renewal date available' },
          { label: 'Digital signatures', value: `${signedCount}/${signerStatuses.length} signed`, detail: `${signerStatuses.length - signedCount} pending signature(s)` },
          { label: 'Re-enrollment', value: reEnrollment ? reEnrollment.status.replace('_', ' ') : 'Not started', detail: reEnrollment?.seatReserved ? `Seat reserved · ${reEnrollment.seatReservationCode ?? 'code pending'}` : 'Seat not reserved yet' }
        ]
      : [
          { label: 'Current contract', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Renewal deadline', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Digital signatures', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Re-enrollment', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    currentContract: current,
    digitalSignature: {
      signers: signerStatuses,
      signatureLog,
      legalNote: current?.legalNote ?? 'Legal e-signature note will appear once a contract is available.'
    },
    reEnrollment,
    history: {
      items: historyItems,
      yearlyComparison: contracts?.yearlyComparison ?? []
    },
    alerts: {
      items: alerts.length
        ? alerts
        : nextAlert
          ? [nextAlert]
          : []
    }
  }
}


function sortActivityBookings(items: ActivityBookingRecord[]) {
  return [...items].sort((left, right) => new Date(right.bookedAt).getTime() - new Date(left.bookedAt).getTime())
}

function sortTransportRequestsNewestFirst(items: TransportRequestRecord[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

function sortTransportStops(items: TransportRouteStopRecord[]) {
  return [...items].sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime())
}

function sortTransportLogsNewestFirst(items: TransportPickupLogRecord[]) {
  return [...items].sort((left, right) => new Date(right.happenedAt).getTime() - new Date(left.happenedAt).getTime())
}

function buildTransportMapUrl(lat: number, lng: number) {
  const safeLat = Number(lat.toFixed(5))
  const safeLng = Number(lng.toFixed(5))
  return `https://www.openstreetmap.org/?mlat=${safeLat}&mlon=${safeLng}#map=14/${safeLat}/${safeLng}`
}

export function buildParentActivitiesView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentActivitiesView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const activities = activeChild ? childActivitiesById[activeChild.id] ?? null : null

  const catalogItems = activities?.catalog ?? []
  const categoryOrder: ParentActivitiesView['catalog']['categories'] = ['sports', 'arts', 'tech', 'languages', 'tutoring']
  const categories = categoryOrder.filter((category) => catalogItems.some((item) => item.category === category))

  const bookings = sortActivityBookings(activities?.bookings ?? [])
  const waitlistCount = bookings.filter((item) => item.status === 'waitlist').length
  const confirmedCount = bookings.filter((item) => item.status === 'confirmed').length
  const trackingItems = activities?.tracking ?? []
  const weeklyReportCount = trackingItems.reduce((sum, item) => sum + item.weeklyReports.length, 0)
  const programs = [...(activities?.programs ?? [])].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
  const registrations = [...(activities?.programRegistrations ?? [])].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())

  const totalSpotsRemaining = catalogItems.reduce((sum, item) => sum + item.spotsRemaining, 0)
  const openPrograms = programs.filter((item) => item.availableSpots > 0).length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && activities
      ? [
          { label: 'Catalog activities', value: String(catalogItems.length), detail: `${categories.length} categories available` },
          { label: 'Confirmed bookings', value: String(confirmedCount), detail: `${waitlistCount} in waitlist` },
          { label: 'Weekly progress updates', value: String(weeklyReportCount), detail: `${trackingItems.length} tracked activities` },
          { label: 'Seasonal programs', value: String(openPrograms), detail: `${totalSpotsRemaining} catalog spots remaining` }
        ]
      : [
          { label: 'Catalog activities', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Confirmed bookings', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Weekly progress updates', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Seasonal programs', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    catalog: {
      items: catalogItems,
      categories
    },
    booking: {
      bookings,
      cancellationPolicy: activities?.cancellationPolicy ?? 'Cancellation policy will appear once activities are enabled.',
      packageDeals: activities?.packageDeals ?? [],
      trialSessionNote: activities?.trialSessionNote ?? 'Trial session details will appear once activities are enabled.',
      waitlistCount
    },
    tracking: {
      items: trackingItems
    },
    programs: {
      items: programs,
      registrations
    }
  }
}

export function buildParentTransportView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentTransportView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const transport = activeChild ? childTransportById[activeChild.id] ?? null : null

  const latestPoint = transport?.livePoints.length ? [...transport.livePoints].sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())[0] ?? null : null
  const routeHistory = [...(transport?.routeHistory ?? [])].sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())
  const notifications = [...(transport?.notifications ?? [])].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  const geofenceAlerts = [...(transport?.geofenceAlerts ?? [])].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  const stops = sortTransportStops(transport?.stops ?? [])
  const pickupLog = sortTransportLogsNewestFirst(transport?.pickupLog ?? [])
  const requests = sortTransportRequestsNewestFirst(transport?.requests ?? [])

  const upcomingStop = stops.find((item) => item.status !== 'served') ?? stops[stops.length - 1]
  const unauthorizedAttempts = pickupLog.filter((item) => !item.authorized).length
  const openRequests = requests.filter((item) => item.status === 'submitted' || item.status === 'reviewing').length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && transport
      ? [
          { label: 'Live ETA', value: latestPoint ? `${latestPoint.etaMinutes} min` : 'Awaiting GPS', detail: upcomingStop ? `Next stop: ${upcomingStop.label}` : 'No stop assigned yet' },
          { label: 'Bus speed', value: latestPoint ? `${latestPoint.speedKmh} km/h` : '0 km/h', detail: latestPoint?.onRoute ? 'Route alignment is normal' : 'Out-of-route alert active' },
          { label: 'Pickup security', value: `${pickupLog.filter((item) => item.authorized).length}/${pickupLog.length} authorized`, detail: unauthorizedAttempts > 0 ? `${unauthorizedAttempts} unauthorized attempt(s) flagged` : 'No unauthorized attempts' },
          { label: 'Transport requests', value: String(openRequests), detail: `${requests.length} request(s) this school year` }
        ]
      : [
          { label: 'Live ETA', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Bus speed', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Pickup security', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Transport requests', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    liveTracking: {
      routeName: transport?.routeName ?? 'Route not assigned',
      mapUrl: latestPoint ? buildTransportMapUrl(latestPoint.position.lat, latestPoint.position.lng) : null,
      latestPoint,
      routeHistory,
      notifications,
      geofenceAlerts
    },
    routeInfo: {
      driver: transport?.driver ?? null,
      stops,
      routeUpdates: transport?.routeUpdates ?? [],
      alternativeRoute: transport?.alternativeRoute ?? null
    },
    pickup: {
      parentQrCode: transport?.parentQrCode ?? null,
      persons: transport?.pickupPersons ?? [],
      log: pickupLog
    },
    requests: {
      items: requests
    }
  }
}

function approvalStatusOrder(status: ApprovalRequestRecord['status']) {
  if (status === 'pending') return 0
  if (status === 'signed') return 1
  if (status === 'revoked') return 2
  return 3
}

function sortApprovals(items: ApprovalRequestRecord[]) {
  return [...items].sort((left, right) => {
    const statusDelta = approvalStatusOrder(left.status) - approvalStatusOrder(right.status)
    if (statusDelta !== 0) return statusDelta
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

function sortApprovalLogs(items: ApprovalSignatureLogRecord[]) {
  return [...items].sort((left, right) => new Date(right.actedAt).getTime() - new Date(left.actedAt).getTime())
}

function collectApprovalReminders(items: ApprovalRequestRecord[]): ApprovalReminderRecord[] {
  return items.flatMap((item) => item.reminders).sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())
}

export function buildParentApprovalsView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentApprovalsView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const approvals = activeChild ? childApprovalsById[activeChild.id] ?? null : null

  const items = sortApprovals(approvals?.items ?? [])
  const signatureLog = sortApprovalLogs(approvals?.signatureLog ?? [])
  const reminders = collectApprovalReminders(items)
  const pendingCount = items.filter((item) => item.status === 'pending').length
  const signedCount = items.filter((item) => item.status === 'signed').length
  const revocableCount = items.filter((item) => item.status === 'signed' && item.canRevoke).length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && approvals
      ? [
          { label: 'Pending approvals', value: String(pendingCount), detail: pendingCount > 0 ? 'School is waiting for parent action' : 'No pending signatures right now' },
          { label: 'Signed this year', value: String(signedCount), detail: `${items.length} total approval record(s)` },
          { label: 'Reminder cadence', value: String(reminders.filter((item) => item.status === 'scheduled').length), detail: '24h, 48h, and 72h reminder automation' },
          { label: 'Revocable consents', value: String(revocableCount), detail: revocableCount > 0 ? 'Consents still inside revocation window' : 'No active revocation windows' }
        ]
      : [
          { label: 'Pending approvals', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Signed this year', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Reminder cadence', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Revocable consents', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    current: {
      items,
      pendingCount,
      signedCount,
      reminders,
      signatureLog,
      flowNote: approvals?.flowNote ?? 'Approval flow details will appear once school requests are available.'
    },
    history: {
      items: [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
      archiveNote: approvals?.archiveNote ?? 'Approval history will appear here when records become available.'
    }
  }
}

function sortConversations(items: CommunicationConversationRecord[]) {
  return [...items].sort((left, right) => {
    if (left.archived !== right.archived) return left.archived ? 1 : -1
    const leftTime = new Date(left.messages[left.messages.length - 1]?.sentAt ?? 0).getTime()
    const rightTime = new Date(right.messages[right.messages.length - 1]?.sentAt ?? 0).getTime()
    return rightTime - leftTime
  })
}

function sortAnnouncements(items: CommunicationAnnouncementRecord[]) {
  return [...items].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1
    if (left.scope !== right.scope) {
      const order: Record<CommunicationAnnouncementRecord['scope'], number> = {
        emergency: 0,
        personal: 1,
        class: 2,
        school_wide: 3
      }
      return order[left.scope] - order[right.scope]
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

function sortAppointments(items: CommunicationAppointmentRecord[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

export function buildParentMessagesView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentMessagesView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const records = activeChild ? childMessagesById[activeChild.id] ?? null : null

  const conversations = sortConversations(records?.conversations ?? [])
  const announcements = sortAnnouncements(records?.announcements ?? [])
  const appointments = sortAppointments(records?.appointments ?? [])
  const unreadAnnouncements = announcements.filter((item) => !item.read).length
  const archivedCount = conversations.filter((item) => item.archived).length
  const unreadConversations = conversations.filter((item) => item.messages.some((row) => row.sender === 'school' && !row.seenAt)).length
  const upcomingMeetings = appointments.filter((item) => item.status === 'requested' || item.status === 'confirmed' || item.status === 'rescheduled').length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && records
      ? [
          { label: 'Active conversations', value: String(conversations.length - archivedCount), detail: `${archivedCount} archived conversation(s)` },
          { label: 'Unread messages', value: String(unreadConversations), detail: 'Seen receipts update when the parent opens the thread' },
          { label: 'Announcements', value: String(unreadAnnouncements), detail: `${announcements.filter((item) => item.pinned).length} pinned or priority posts` },
          { label: 'Meetings', value: String(upcomingMeetings), detail: `${appointments.length} total appointment record(s)` }
        ]
      : [
          { label: 'Active conversations', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Unread messages', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Announcements', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Meetings', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    messaging: {
      conversations,
      archivedCount
    },
    announcements: {
      items: announcements,
      unreadCount: unreadAnnouncements,
      pinnedCount: announcements.filter((item) => item.pinned).length
    },
    appointments: {
      slots: records?.appointmentSlots ?? [],
      items: appointments
    },
    preferences: {
      item: records?.preferences ?? null
    }
  }
}

const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  behavior: 'Behavior',
  facilities: 'Facilities',
  transport: 'Transport',
  cantine_food: 'Cantine / Food',
  safety_security: 'Safety & Security',
  staff_behavior: 'Staff behavior',
  other: 'Other'
}

function complaintStatusOrder(status: ComplaintModuleRecord['status']) {
  if (status === 'reopened') return 0
  if (status === 'in_progress') return 1
  if (status === 'submitted') return 2
  return 3
}

function complaintPriorityOrder(priority: ComplaintModuleRecord['priority']) {
  if (priority === 'urgent') return 0
  if (priority === 'high') return 1
  if (priority === 'medium') return 2
  return 3
}

function sortComplaints(items: ComplaintModuleRecord[]) {
  return [...items].sort((left, right) => {
    const statusDelta = complaintStatusOrder(left.status) - complaintStatusOrder(right.status)
    if (statusDelta !== 0) return statusDelta
    const priorityDelta = complaintPriorityOrder(left.priority) - complaintPriorityOrder(right.priority)
    if (priorityDelta !== 0) return priorityDelta
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

function buildSurveyAggregate(submissions: SatisfactionSurveySubmissionRecord[]): SatisfactionSurveyAggregateView {
  const totalResponses = submissions.length
  const anonymousResponses = submissions.filter((item) => item.anonymous).length
  const npsTotal = submissions.reduce((sum, item) => sum + item.npsScore, 0)
  const promoters = submissions.filter((item) => item.npsScore >= 9).length
  const passives = submissions.filter((item) => item.npsScore >= 7 && item.npsScore <= 8).length
  const detractors = submissions.filter((item) => item.npsScore <= 6).length
  const averageNps = totalResponses > 0 ? Math.round((npsTotal / totalResponses) * 10) / 10 : 0
  const npsScore = totalResponses > 0
    ? Math.round(((promoters / totalResponses) * 100) - ((detractors / totalResponses) * 100))
    : 0

  const categoryAverages = Object.entries(complaintCategoryLabels).map(([category, label]) => {
    const ratings = submissions.flatMap((item) => item.categoryRatings.filter((entry) => entry.category === category))
    const averageScore = ratings.length > 0
      ? Math.round(((ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length) * 10)) / 10
      : 0
    return {
      category: category as ComplaintCategory,
      label,
      averageScore
    }
  })

  const latestSuggestions = [...submissions]
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
    .map((item) => item.suggestion?.trim() ?? '')
    .filter((item) => item.length > 0)
    .slice(0, 5)

  return {
    totalResponses,
    anonymousResponses,
    averageNps,
    npsScore,
    promoters,
    passives,
    detractors,
    categoryAverages,
    latestSuggestions
  }
}

function averageResolutionHours(items: ComplaintModuleRecord[]) {
  const resolved = items.filter((item) => item.status === 'resolved')
  if (!resolved.length) return null
  const totalHours = resolved.reduce((sum, item) => {
    const delta = new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()
    return sum + Math.max(0, delta / (60 * 60 * 1000))
  }, 0)
  return Math.round((totalHours / resolved.length) * 10) / 10
}

export function buildParentComplaintsView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentComplaintsView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const records = activeChild ? childComplaintsById[activeChild.id] ?? null : null

  const complaints = sortComplaints(records?.complaints ?? [])
  const openCount = complaints.filter((item) => item.status !== 'resolved').length
  const resolvedCount = complaints.filter((item) => item.status === 'resolved').length
  const escalatedCount = complaints.filter((item) => item.escalation.escalated).length
  const avgResolutionHours = averageResolutionHours(complaints)
  const surveyAggregate = buildSurveyAggregate(records?.survey.submissions ?? [])

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && records
      ? [
          { label: 'Open complaints', value: String(openCount), detail: `${complaints.length} total complaint record(s)` },
          { label: 'Escalated', value: String(escalatedCount), detail: 'Cases escalated after SLA threshold' },
          { label: 'Resolved', value: String(resolvedCount), detail: avgResolutionHours === null ? 'Resolution timing pending' : `Avg ${avgResolutionHours.toFixed(1)}h to resolve` },
          { label: 'Monthly NPS', value: `${surveyAggregate.npsScore}`, detail: `${surveyAggregate.totalResponses} survey response(s)` }
        ]
      : [
          { label: 'Open complaints', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Escalated', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Resolved', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Monthly NPS', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    complaints: {
      items: complaints,
      openCount,
      resolvedCount,
      escalatedCount,
      averageResolutionHours: avgResolutionHours
    },
    survey: {
      monthLabel: records?.survey.monthLabel ?? 'No active month',
      submissionWindow: records?.survey.submissionWindow ?? 'No submission window',
      note: records?.survey.note ?? 'Survey aggregation becomes available once responses are submitted.',
      submissionsCount: records?.survey.submissions.length ?? 0,
      aggregate: surveyAggregate
    }
  }
}

export function buildParentSchoolLifeView(account: SeedUser | null, selectedChildId?: string | null, storage?: Storage | null): ParentSchoolLifeView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const children = parent?.children ?? []
  const activeChild = children.find((child: ParentAccount['children'][number]) => child.id === selectedChildId) ?? children[0] ?? null
  const records = activeChild ? childSchoolLifeById[activeChild.id] ?? null : null

  const canteen = records?.canteen
    ? {
        weeklyMenu: records.canteen.weeklyMenu.map((item) => ({
          ...item,
          allergens: [...item.allergens],
          dietTags: [...item.dietTags]
        })),
        balanceMad: records.canteen.balanceMad,
        paymentHistory: records.canteen.paymentHistory.map((item) => ({ ...item })),
        specialDietRequests: records.canteen.specialDietRequests.map((item) => ({ ...item })),
        notes: records.canteen.notes
      }
    : {
        weeklyMenu: [],
        balanceMad: 0,
        paymentHistory: [],
        specialDietRequests: [],
        notes: 'Canteen details will appear once a child is linked.'
      }

  const health = records?.health
    ? {
        bloodType: records.health.bloodType,
        allergies: [...records.health.allergies],
        chronicConditions: [...records.health.chronicConditions],
        currentMedications: [...records.health.currentMedications],
        vaccinations: records.health.vaccinations.map((item) => ({ ...item })),
        emergencyContacts: records.health.emergencyContacts.map((item) => ({ ...item })),
        incidents: records.health.incidents.map((item) => ({ ...item })),
        visits: records.health.visits.map((item) => ({ ...item })),
        recommendations: [...records.health.recommendations]
      }
    : {
        bloodType: 'Pending',
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        vaccinations: [],
        emergencyContacts: [],
        incidents: [],
        visits: [],
        recommendations: ['Medical records will appear once a child is linked.']
      }

  const dailyReport: ParentSchoolLifeView['dailyReport'] = records?.dailyReport
    ? {
        sentAt: records.dailyReport.sentAt,
        ate: records.dailyReport.ate,
        mealAmount: records.dailyReport.mealAmount,
        nap: records.dailyReport.nap,
        napDuration: records.dailyReport.napDuration,
        mood: records.dailyReport.mood,
        activities: [...records.dailyReport.activities],
        photos: records.dailyReport.photos.map((item) => ({ ...item })),
        teacherComment: records.dailyReport.teacherComment,
        diaperChanges: records.dailyReport.diaperChanges,
        skills: records.dailyReport.skills.map((item) => ({ ...item }))
      }
    : {
        sentAt: 'Waiting for the end-of-day report',
        ate: false,
        mealAmount: 'No report available',
        nap: false,
        napDuration: 'No report available',
        mood: 'okay',
        activities: [],
        photos: [],
        teacherComment: 'Daily report cards will appear here after school submits them.',
        diaperChanges: null,
        skills: []
      }

  const behavior = records?.behavior
    ? {
        points: records.behavior.points,
        badges: records.behavior.badges.map((item) => ({ ...item })),
        alerts: records.behavior.alerts.map((item) => ({ ...item })),
        monthlyReports: records.behavior.monthlyReports.map((item) => ({ ...item })),
        leaderboardEnabled: records.behavior.leaderboardEnabled,
        leaderboard: records.behavior.leaderboard.map((item) => ({ ...item }))
      }
    : {
        points: 0,
        badges: [],
        alerts: [],
        monthlyReports: [],
        leaderboardEnabled: false,
        leaderboard: []
      }

  const events = records?.events
    ? {
        calendarLabel: records.events.calendarLabel,
        volunteerNote: records.events.volunteerNote,
        items: records.events.items.map((item) => ({
          ...item,
          media: item.media.map((asset) => ({ ...asset }))
        }))
      }
    : {
        calendarLabel: 'Event calendar pending',
        volunteerNote: 'School events will appear here once a child is linked.',
        items: []
      }

  const allergyCount = health.allergies.length

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: parent?.school ?? schoolBrand,
    linkedSchools: parent?.linkedSchools ?? [parent?.school ?? schoolBrand],
    displayName: parent?.profile?.displayName ?? 'Parent',
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    activeChildInitials: initialsFromName(activeChild?.fullName ?? 'Parent Student'),
    childTabs: children.map((child: ParentAccount['children'][number]) => ({ id: child.id, fullName: child.fullName, gradeLabel: child.gradeLabel, schoolName: child.school?.name ?? parent?.school?.name ?? 'School', initials: initialsFromName(child.fullName), isActive: child.id === activeChild?.id })),
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: activeChild && records
      ? [
          { label: 'Canteen balance', value: formatMad(canteen.balanceMad), detail: `${canteen.paymentHistory.length} payment record(s)` },
          { label: 'Health flags', value: `${allergyCount} allergy${allergyCount === 1 ? '' : 'ies'}`, detail: `${health.chronicConditions.length} chronic condition(s)` },
          { label: 'Daily report', value: dailyReport.mood === 'happy' ? 'Happy' : dailyReport.mood === 'okay' ? 'Okay' : 'Sad', detail: `${dailyReport.ate ? 'ate lunch' : 'did not eat'} · ${dailyReport.nap ? 'napped' : 'no nap'}` },
          { label: 'Behavior points', value: `${behavior.points} pts`, detail: `${behavior.badges.length} badge(s) earned` }
        ]
      : [
          { label: 'Canteen balance', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Health flags', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Daily report', value: 'Unavailable', detail: 'No linked child yet' },
          { label: 'Behavior points', value: 'Unavailable', detail: 'No linked child yet' }
        ],
    canteen,
    health,
    dailyReport,
    behavior,
    events
  }
}

export function buildParentSchoolProfileView(account: SeedUser | null, selectedSchoolId?: string | null, storage?: Storage | null): ParentSchoolProfileView {
  const parent = account?.role === 'parent' ? account as ParentAccount : null
  const schools = parent?.linkedSchools ?? [parent?.school ?? schoolBrand]
  const activeSchool = schools.find((school) => school.id === selectedSchoolId) ?? schools[0] ?? schoolBrand
  const fallbackProfile = schoolProfilesById[schoolBrand.id]
  if (!fallbackProfile) {
    throw new Error('Missing default school profile seed')
  }
  const records: SchoolProfileRecord = schoolProfilesById[activeSchool.id] ?? fallbackProfile
  const heroStats = records.successStats.slice(0, 4).map((item) => ({ label: item.label, value: item.value, detail: item.detail }))

  return {
    role: parent?.role ?? 'parent',
    roleLabel: ROLE_LABELS[parent?.role ?? 'parent'],
    school: activeSchool,
    linkedSchools: schools,
    displayName: parent?.profile?.displayName ?? 'Parent',
    devices: parent ? listDevicesForAccount(parent, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    activeSchoolId: activeSchool.id,
    schoolTabs: schools.map((school) => ({
      id: school.id,
      name: school.name,
      campus: school.campus,
      accent: school.accent,
      isActive: school.id === activeSchool.id
    })),
    heroStats: heroStats.length > 0 ? heroStats : [
      { label: 'Brand', value: 'Unavailable', detail: 'No school profile linked yet' },
      { label: 'Calendar', value: 'Unavailable', detail: 'No term calendar available' },
      { label: 'News', value: 'Unavailable', detail: 'No school news available' },
      { label: 'Campus', value: 'Unavailable', detail: 'No campus profile available' }
    ],
    brand: records.brand,
    mission: records.mission,
    vision: records.vision,
    values: records.values.map((item) => ({ ...item })),
    certifications: records.certifications.map((item) => ({ ...item })),
    successStats: records.successStats.map((item) => ({ ...item })),
    testimonials: records.testimonials.map((item) => ({ ...item })),
    socialLinks: records.socialLinks.map((item) => ({ ...item })),
    gallery: records.gallery.map((item) => ({ ...item })),
    staff: records.staff.map((item) => ({ ...item })),
    calendar: {
      termLabel: records.calendar.termLabel,
      breaks: [...records.calendar.breaks],
      items: records.calendar.items.map((item) => ({ ...item })),
      downloads: records.calendar.downloads.map((item) => ({ ...item }))
    },
    news: records.news.map((item) => ({
      ...item,
      media: item.media.map((asset) => ({ ...asset })),
      shareLinks: item.shareLinks.map((link) => ({ ...link }))
    }))
  }
}

export function buildSchoolAdminPanelView(account: SeedUser | null, storage?: Storage | null): SchoolAdminPanelView {
  const admin = account?.role === 'school_admin' ? account : null
  const fallbackPanel = schoolAdminPanelsById[schoolBrand.id]
  if (!fallbackPanel) {
    throw new Error('Missing default school admin panel seed')
  }

  const activeSchool = admin?.school ?? schoolBrand
  const panel = schoolAdminPanelsById[activeSchool.id] ?? fallbackPanel

  return {
    role: admin?.role ?? 'school_admin',
    roleLabel: ROLE_LABELS[admin?.role ?? 'school_admin'],
    displayName: admin?.profile?.displayName ?? 'School Admin',
    school: activeSchool,
    devices: admin ? listDevicesForAccount(admin, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    dashboard: {
      heroStats: panel.dashboard.heroStats.map((item) => ({ ...item })),
      revenueThisMonthMad: panel.dashboard.revenueThisMonthMad,
      revenueLastMonthMad: panel.dashboard.revenueLastMonthMad,
      revenueDeltaLabel: panel.dashboard.revenueDeltaLabel,
      upcomingEvents: panel.dashboard.upcomingEvents.map((item) => ({ ...item })),
      quickActions: panel.dashboard.quickActions.map((item) => ({ ...item }))
    },
    studentManagement: {
      stats: panel.studentManagement.stats.map((item) => ({ ...item })),
      classes: panel.studentManagement.classes.map((item) => ({ ...item })),
      students: panel.studentManagement.students.map((item) => ({ ...item })),
      imports: panel.studentManagement.imports.map((item) => ({ ...item })),
      documents: panel.studentManagement.documents.map((item) => ({ ...item }))
    },
    parentManagement: {
      stats: panel.parentManagement.stats.map((item) => ({ ...item })),
      parents: panel.parentManagement.parents.map((item) => ({ ...item })),
      access: panel.parentManagement.access.map((item) => ({ ...item })),
      communications: panel.parentManagement.communications.map((item) => ({ ...item })),
      controls: panel.parentManagement.controls.map((item) => ({ ...item }))
    },
    teacherManagement: {
      stats: panel.teacherManagement.stats.map((item) => ({ ...item })),
      teachers: panel.teacherManagement.teachers.map((item) => ({ ...item })),
      timetables: panel.teacherManagement.timetables.map((item) => ({ ...item }))
    },
    financialManagement: {
      stats: panel.financialManagement.stats.map((item) => ({ ...item })),
      outstanding: panel.financialManagement.outstanding.map((item) => ({ ...item })),
      reminders: panel.financialManagement.reminders.map((item) => ({ ...item })),
      exports: panel.financialManagement.exports.map((item) => ({ ...item })),
      forecast: panel.financialManagement.forecast.map((item) => ({
        ...item,
        amountLabel: formatMad(item.amountMad)
      })),
      revenueThisMonth: formatMad(panel.dashboard.revenueThisMonthMad),
      revenueLastMonth: formatMad(panel.dashboard.revenueLastMonthMad),
      revenueDeltaLabel: panel.dashboard.revenueDeltaLabel
    },
    communicationCenter: {
      stats: panel.communicationCenter.stats.map((item) => ({ ...item })),
      announcements: panel.communicationCenter.announcements.map((item) => ({ ...item })),
      approvals: panel.communicationCenter.approvals.map((item) => ({ ...item })),
      templates: panel.communicationCenter.templates.map((item) => ({ ...item })),
      scheduled: panel.communicationCenter.scheduled.map((item) => ({ ...item }))
    },
    reports: {
      stats: panel.reports.stats.map((item) => ({ ...item })),
      exports: panel.reports.exports.map((item) => ({ ...item })),
      highlights: [...panel.reports.highlights],
      builderBlocks: [...panel.reports.builderBlocks]
    },
    settings: {
      stats: panel.settings.stats.map((item) => ({ ...item })),
      items: panel.settings.items.map((item) => ({ ...item }))
    },
    securityPrivacy: {
      stats: panel.securityPrivacy.stats.map((item) => ({ ...item })),
      controls: panel.securityPrivacy.controls.map((item) => ({ ...item })),
      compliance: panel.securityPrivacy.compliance.map((item) => ({ ...item })),
      resilience: panel.securityPrivacy.resilience.map((item) => ({ ...item }))
    }
  }
}

export function buildSuperAdminPanelView(account: SeedUser | null, storage?: Storage | null): SuperAdminPanelView {
  const admin = account?.role === 'super_admin' ? account : null
  const fallbackPanel = superAdminPanelById[platformBrand.id]
  if (!fallbackPanel) {
    throw new Error('Missing default super admin panel seed')
  }

  const activeSchool = admin?.school ?? platformBrand
  const panel = superAdminPanelById[activeSchool.id] ?? fallbackPanel

  return {
    role: admin?.role ?? 'super_admin',
    roleLabel: ROLE_LABELS[admin?.role ?? 'super_admin'],
    displayName: admin?.profile?.displayName ?? 'Super Admin',
    school: activeSchool,
    devices: admin ? listDevicesForAccount(admin, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    heroStats: panel.heroStats.map((item) => ({ ...item })),
    schools: panel.schools.map((item) => ({ ...item })),
    revenue: panel.revenue.map((item) => ({ ...item })),
    users: panel.users.map((item) => ({ ...item })),
    churn: {
      rate: panel.churn.rate,
      retentionRate: panel.churn.retentionRate,
      detail: panel.churn.detail,
      history: panel.churn.history.map((item) => ({ ...item }))
    },
    featureUsage: panel.featureUsage.map((item) => ({ ...item })),
    serverHealth: panel.serverHealth.map((item) => ({ ...item })),
    supportTickets: panel.supportTickets.map((item) => ({ ...item })),
    onboarding: panel.onboarding.map((item) => ({ ...item })),
    subscriptions: panel.subscriptions.map((item) => ({ ...item })),
    featureFlags: panel.featureFlags.map((item) => ({ ...item })),
    announcements: panel.announcements.map((item) => ({ ...item })),
    whiteLabel: panel.whiteLabel.map((item) => ({ ...item })),
    quickActions: panel.quickActions.map((item) => ({ ...item })),
    securityPrivacy: {
      stats: panel.securityPrivacy.stats.map((item) => ({ ...item })),
      controls: panel.securityPrivacy.controls.map((item) => ({ ...item })),
      compliance: panel.securityPrivacy.compliance.map((item) => ({ ...item })),
      resilience: panel.securityPrivacy.resilience.map((item) => ({ ...item }))
    },
    monetization: {
      tiers: panel.monetization.tiers.map((item) => ({ ...item, features: [...item.features] })),
      addons: panel.monetization.addons.map((item) => ({ ...item }))
    }
  }
}
export function buildRoleWorkspaceView(account: SeedUser | null, storage?: Storage | null): RoleWorkspaceView {
  const summary: WorkspaceSummary | undefined = account?.workspaceSummary
  return {
    role: account?.role ?? 'school_admin',
    roleLabel: ROLE_LABELS[account?.role ?? 'school_admin'],
    displayName: account?.profile?.displayName ?? 'User',
    school: account?.school ?? schoolBrand,
    title: summary?.title ?? 'Workspace overview',
    description: summary?.description ?? 'This role workspace is ready for the next implementation step.',
    devices: account ? listDevicesForAccount(account, storage).map((device) => formatDevice(device)) as ViewDevice[] : [],
    metrics: summary?.metrics ?? [
      { label: 'Readiness', value: 'Ready', detail: 'Foundation in place' },
      { label: 'Access', value: 'Secured', detail: 'Role guard active' },
      { label: 'Next step', value: 'Module', detail: 'Feature work can start cleanly' }
    ],
    priorities: summary?.priorities ?? ['Define the first operational flow for this role.']
  }
}














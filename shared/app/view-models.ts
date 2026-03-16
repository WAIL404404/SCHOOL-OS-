import { quickActionModules, ROLE_LABELS, schoolBrand } from './data.ts'
import { childActivitiesById } from './activities.ts'
import { childContractsById } from './contracts.ts'
import { childFinanceById } from './finance.ts'
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
  ChildRecord,
  ContractSignatureLogRecord,
  FinancialRequestRecord,
  ParentAcademicsView,
  ParentAccount,
  ParentActivitiesView,
  ParentContractsView,
  ParentDashboardView,
  ParentFinancialView,
  RoleWorkspaceView,
  SeedUser,
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









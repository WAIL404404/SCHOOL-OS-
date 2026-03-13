import { quickActionModules, ROLE_LABELS, schoolBrand } from './data.ts'
import { listDevicesForAccount } from './session.ts'
import type {
  AcademicAttendanceBadgeView,
  AcademicCalendarLinkView,
  AcademicGradeChartPointView,
  AcademicHomeworkRecord,
  AcademicScheduleDayView,
  ChildRecord,
  ParentAcademicsView,
  ParentAccount,
  ParentDashboardView,
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
      parentAlerts: homeworkItems.map((item) => item.parentNotification).filter((value): value is string => Boolean(value))
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



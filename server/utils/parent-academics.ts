import { seedParentAccounts } from '~/shared/app/data'
import type { AcademicAbsenceReasonRecord, AcademicHomeworkRecord, AcademicRealtimeNotificationView, ChildRecord } from '~/shared/app/types'

interface ParentAcademicsStore {
  sequence: number
  absenceReasonsByChild: Record<string, AcademicAbsenceReasonRecord[]>
  customNotificationsByChild: Record<string, AcademicRealtimeNotificationView[]>
}

function createStore(): ParentAcademicsStore {
  return {
    sequence: 0,
    absenceReasonsByChild: {},
    customNotificationsByChild: {}
  }
}

function getStore() {
  const key = '__school_os_parent_academics_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentAcademicsStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentAcademicsStore
}

export function findChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

function toIsoIfValid(value: string, fallback = new Date().toISOString()) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed.toISOString()
}

function scheduleNotifications(child: ChildRecord): AcademicRealtimeNotificationView[] {
  return (child.academics?.scheduleUpdates ?? []).map((update, index) => ({
    id: `schedule-${update.id}`,
    childId: child.id,
    title: update.title,
    detail: update.detail,
    tone: update.tone,
    source: 'schedule',
    createdAt: new Date(Date.now() - (index + 1) * 60 * 1000).toISOString()
  }))
}

function homeworkNotifications(child: ChildRecord): AcademicRealtimeNotificationView[] {
  return (child.academics?.homework ?? [])
    .filter((item) => item.parentNotification)
    .map((item) => ({
      id: `homework-${item.id}`,
      childId: child.id,
      title: `Homework ${item.status === 'late' ? 'late' : 'reminder'}`,
      detail: item.parentNotification as string,
      tone: item.status === 'late' ? 'warning' : 'info',
      source: 'homework',
      createdAt: toIsoIfValid(item.dueAt)
    }))
}

function examNotifications(child: ChildRecord): AcademicRealtimeNotificationView[] {
  return (child.academics?.exams ?? []).map((item, index) => ({
    id: `exam-${item.id}`,
    childId: child.id,
    title: `Exam reminder · ${item.subject}`,
    detail: `Reminder date ${item.reminderDate}. ${item.result ? `Result: ${item.result}` : 'Result pending.'}`,
    tone: 'info',
    source: 'exam',
    createdAt: new Date(Date.now() - (index + 1) * 45 * 1000).toISOString()
  }))
}

function attendanceNotifications(child: ChildRecord): AcademicRealtimeNotificationView[] {
  const attendance = child.academics?.attendance
  if (!attendance) return []

  const tone = attendance.todayStatus === 'present' ? 'calm' : 'warning'
  return [{
    id: `attendance-${child.id}-${attendance.todayStatus}`,
    childId: child.id,
    title: `Attendance · ${attendance.todayStatus.toUpperCase()}`,
    detail: attendance.todayDetail,
    tone,
    source: 'attendance',
    createdAt: new Date().toISOString()
  }]
}

function buildClassHookNotifications(child: ChildRecord, nowMs: number): AcademicRealtimeNotificationView[] {
  const entries = child.academics?.scheduleEntries ?? []
  return entries
    .map((entry) => {
      const startsAtMs = new Date(entry.startsAt).getTime()
      if (Number.isNaN(startsAtMs)) return null

      const reminderAtMs = startsAtMs - entry.notificationLeadMinutes * 60 * 1000
      const windowStart = reminderAtMs
      const windowEnd = startsAtMs
      const inWindow = nowMs >= windowStart && nowMs <= windowEnd
      if (!inWindow) return null

      return {
        id: `hook-class-${entry.id}`,
        childId: child.id,
        title: `Class starts soon · ${entry.subject}`,
        detail: `${entry.subject} starts at ${new Date(entry.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} in ${entry.room}.`,
        tone: 'info',
        source: 'hook',
        createdAt: new Date().toISOString()
      } as AcademicRealtimeNotificationView
    })
    .filter((item): item is AcademicRealtimeNotificationView => Boolean(item))
}

function buildHomeworkHookNotifications(child: ChildRecord, nowMs: number): AcademicRealtimeNotificationView[] {
  const dayMs = 24 * 60 * 60 * 1000
  const items = child.academics?.homework ?? []
  return items
    .filter((item: AcademicHomeworkRecord) => item.status !== 'submitted')
    .map((item) => {
      const dueMs = new Date(item.dueAt).getTime()
      if (Number.isNaN(dueMs)) return null
      const diff = dueMs - nowMs
      if (diff < 0 || diff > dayMs) return null

      return {
        id: `hook-homework-${item.id}`,
        childId: child.id,
        title: `Deadline approaching · ${item.subject}`,
        detail: `${item.title} is due by ${new Date(item.dueAt).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
        tone: item.status === 'late' ? 'warning' : 'info',
        source: 'hook',
        createdAt: new Date().toISOString()
      } as AcademicRealtimeNotificationView
    })
    .filter((item): item is AcademicRealtimeNotificationView => Boolean(item))
}

function buildExamHookNotifications(child: ChildRecord, nowMs: number): AcademicRealtimeNotificationView[] {
  const twoDaysMs = 48 * 60 * 60 * 1000
  const items = child.academics?.exams ?? []
  return items
    .filter((exam) => !exam.result)
    .map((exam) => {
      const startsAtMs = new Date(exam.startsAt).getTime()
      if (Number.isNaN(startsAtMs)) return null
      const diff = startsAtMs - nowMs
      if (diff < 0 || diff > twoDaysMs) return null

      return {
        id: `hook-exam-${exam.id}`,
        childId: child.id,
        title: `Exam in next 48h · ${exam.subject}`,
        detail: `${exam.subject} is scheduled for ${new Date(exam.startsAt).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`,
        tone: 'warning',
        source: 'hook',
        createdAt: new Date().toISOString()
      } as AcademicRealtimeNotificationView
    })
    .filter((item): item is AcademicRealtimeNotificationView => Boolean(item))
}

function hookNotifications(child: ChildRecord): AcademicRealtimeNotificationView[] {
  const nowMs = Date.now()
  return [
    ...buildClassHookNotifications(child, nowMs),
    ...buildHomeworkHookNotifications(child, nowMs),
    ...buildExamHookNotifications(child, nowMs)
  ]
}

function absenceNotifications(notes: AcademicAbsenceReasonRecord[]): AcademicRealtimeNotificationView[] {
  return notes.map((note) => ({
    id: `absence-note-${note.id}`,
    childId: note.childId,
    title: 'Absence reason submitted',
    detail: note.reason,
    tone: 'info',
    source: 'absence',
    createdAt: note.createdAt
  }))
}

export function listRealtimeNotifications(childId: string) {
  const child = findChildById(childId)
  if (!child) return []

  const store = getStore()
  const absenceNotes = store.absenceReasonsByChild[childId] ?? []
  const custom = store.customNotificationsByChild[childId] ?? []
  const all = [
    ...hookNotifications(child),
    ...scheduleNotifications(child),
    ...homeworkNotifications(child),
    ...examNotifications(child),
    ...attendanceNotifications(child),
    ...absenceNotifications(absenceNotes),
    ...custom
  ]

  const seen = new Set<string>()
  const deduped = all.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  deduped.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  return deduped.slice(0, 24)
}

export function addAbsenceReason(childId: string, reason: string) {
  const store = getStore()
  store.sequence += 1

  const note: AcademicAbsenceReasonRecord = {
    id: `note-${store.sequence}`,
    childId,
    reason,
    createdAt: new Date().toISOString(),
    status: 'submitted'
  }

  const existingNotes = store.absenceReasonsByChild[childId] ?? []
  store.absenceReasonsByChild[childId] = [note, ...existingNotes].slice(0, 30)

  const notification: AcademicRealtimeNotificationView = {
    id: `absence-custom-${note.id}`,
    childId,
    title: 'Absence note sent to school office',
    detail: reason,
    tone: 'info',
    source: 'absence',
    createdAt: note.createdAt
  }

  const existingNotifications = store.customNotificationsByChild[childId] ?? []
  store.customNotificationsByChild[childId] = [notification, ...existingNotifications].slice(0, 30)

  return { note, notification }
}

import { childMessagesById } from '~/shared/app/messages'
import { seedParentAccounts } from '~/shared/app/data'
import type {
  ChildMessagesRecord,
  CommunicationAnnouncementRecord,
  CommunicationAppointmentRecord,
  CommunicationAppointmentReminderRecord,
  CommunicationAppointmentSlotRecord,
  CommunicationConversationRecord,
  ConversationMessageRecord,
  CommunicationNotificationPreferencesRecord
} from '~/shared/app/types'

interface ParentMessagesStore {
  sequence: number
  byChild: Record<string, ChildMessagesRecord>
}

interface SendMessageInput {
  childId: string
  conversationId: string
  body: string
  attachmentKind: 'image' | 'file' | 'voice_note' | 'pdf' | 'video' | 'none'
  attachmentLabel: string
}

interface ArchiveConversationInput {
  childId: string
  conversationId: string
  archived: boolean
}

interface MarkAnnouncementReadInput {
  childId: string
  announcementId: string
}

interface RequestAppointmentInput {
  childId: string
  participantId: string
  slotId: string
  purpose: string
}

interface UpdateAppointmentInput {
  childId: string
  appointmentId: string
  action: 'confirm' | 'reschedule' | 'cancel'
  slotId?: string
}

interface UpdatePreferencesInput {
  childId: string
  preferences: CommunicationNotificationPreferencesRecord
}

function cloneMessage(item: ConversationMessageRecord): ConversationMessageRecord {
  return {
    ...item,
    attachments: item.attachments.map((entry) => ({ ...entry }))
  }
}

function cloneConversation(item: CommunicationConversationRecord): CommunicationConversationRecord {
  return {
    ...item,
    participant: { ...item.participant },
    messages: item.messages.map((entry) => cloneMessage(entry))
  }
}

function cloneAnnouncement(item: CommunicationAnnouncementRecord): CommunicationAnnouncementRecord {
  return {
    ...item,
    attachments: item.attachments.map((entry) => ({ ...entry }))
  }
}

function cloneReminder(item: CommunicationAppointmentReminderRecord): CommunicationAppointmentReminderRecord {
  return { ...item }
}

function cloneAppointment(item: CommunicationAppointmentRecord): CommunicationAppointmentRecord {
  return {
    ...item,
    reminders: item.reminders.map((entry) => cloneReminder(entry)),
    actionItems: [...item.actionItems]
  }
}

function clonePreferences(item: CommunicationNotificationPreferencesRecord): CommunicationNotificationPreferencesRecord {
  return {
    channels: { ...item.channels },
    frequency: item.frequency,
    doNotDisturbStart: item.doNotDisturbStart,
    doNotDisturbEnd: item.doNotDisturbEnd,
    whatsapp: { ...item.whatsapp }
  }
}

function cloneRecord(record: ChildMessagesRecord): ChildMessagesRecord {
  return {
    conversations: record.conversations.map((item) => cloneConversation(item)),
    announcements: record.announcements.map((item) => cloneAnnouncement(item)),
    appointmentSlots: record.appointmentSlots.map((item) => ({ ...item })),
    appointments: record.appointments.map((item) => cloneAppointment(item)),
    preferences: clonePreferences(record.preferences)
  }
}

function createStore(): ParentMessagesStore {
  const byChild: ParentMessagesStore['byChild'] = {}
  for (const [childId, record] of Object.entries(childMessagesById)) {
    byChild[childId] = cloneRecord(record)
  }
  return {
    sequence: 0,
    byChild
  }
}

function getStore() {
  const key = '__school_os_parent_messages_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentMessagesStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentMessagesStore
}

function nowIso() {
  return new Date().toISOString()
}

function pad(value: number, size: number) {
  return String(value).padStart(size, '0')
}

function textAsset(kind: Exclude<SendMessageInput['attachmentKind'], 'none'>, label: string) {
  return {
    id: `asset-${pad(Date.now() % 100000, 5)}`,
    kind,
    label,
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(`${label}\nShared from parent app`)}` 
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
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

function sortAppointments(items: CommunicationAppointmentRecord[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

function findSlot(record: ChildMessagesRecord, slotId: string) {
  return record.appointmentSlots.find((item) => item.id === slotId) ?? null
}

function buildReminders(startsAt: string): CommunicationAppointmentReminderRecord[] {
  const startMs = new Date(startsAt).getTime()
  return [
    {
      id: `rem-1day-${pad(startMs % 100000, 5)}`,
      trigger: '1_day',
      scheduledFor: new Date(startMs - 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    },
    {
      id: `rem-1hour-${pad((startMs + 1) % 100000, 5)}`,
      trigger: '1_hour',
      scheduledFor: new Date(startMs - 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    }
  ]
}

export function findMessageChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function getMessagesRecord(childId: string) {
  const record = getStore().byChild[childId]
  if (!record) return null

  return {
    conversations: sortConversations(record.conversations).map((item) => cloneConversation(item)),
    announcements: sortAnnouncements(record.announcements).map((item) => cloneAnnouncement(item)),
    appointmentSlots: record.appointmentSlots.map((item) => ({ ...item })),
    appointments: sortAppointments(record.appointments).map((item) => cloneAppointment(item)),
    preferences: clonePreferences(record.preferences)
  }
}

export function sendConversationMessage(input: SendMessageInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  const body = input.body.trim()
  if (!body) throw new Error('Message text is required')

  const conversation = record.conversations.find((item) => item.id === input.conversationId)
  if (!conversation) throw new Error('Conversation not found')

  store.sequence += 1
  const sentAt = nowIso()
  conversation.messages.push({
    id: `msg-live-${pad(store.sequence, 4)}`,
    sender: 'parent',
    senderName: 'Parent',
    body,
    sentAt,
    seenAt: null,
    attachments: input.attachmentKind === 'none' ? [] : [textAsset(input.attachmentKind, input.attachmentLabel.trim() || `${input.attachmentKind} attachment`)]
  })
  conversation.lastMessagePreview = body
  conversation.archived = false

  return {
    ...getMessagesRecord(input.childId),
    message: 'Message sent successfully.'
  }
}

export function archiveConversation(input: ArchiveConversationInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  const conversation = record.conversations.find((item) => item.id === input.conversationId)
  if (!conversation) throw new Error('Conversation not found')
  conversation.archived = input.archived

  return {
    ...getMessagesRecord(input.childId),
    message: input.archived ? 'Conversation archived.' : 'Conversation restored.'
  }
}

export function markAnnouncementRead(input: MarkAnnouncementReadInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  const announcement = record.announcements.find((item) => item.id === input.announcementId)
  if (!announcement) throw new Error('Announcement not found')
  announcement.read = true
  announcement.acknowledgedAt = announcement.acknowledgedAt ?? nowIso()

  return {
    ...getMessagesRecord(input.childId),
    message: 'Announcement marked as read.'
  }
}

export function requestAppointment(input: RequestAppointmentInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  const slot = findSlot(record, input.slotId)
  if (!slot || !slot.available) throw new Error('Selected time slot is not available')
  const purpose = input.purpose.trim()
  if (!purpose) throw new Error('Meeting purpose is required')

  const convo = record.conversations.find((item) => item.participant.id === input.participantId)
  if (!convo) throw new Error('Participant not found')

  store.sequence += 1
  slot.available = false
  record.appointments.unshift({
    id: `appt-live-${pad(store.sequence, 4)}`,
    participantId: convo.participant.id,
    participantLabel: `${convo.participant.fullName} · ${convo.participant.title}`,
    purpose,
    status: 'requested',
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    mode: slot.mode,
    meetingLink: slot.mode === 'virtual' ? `https://meet.google.com/schoolos-${pad(store.sequence, 4)}` : null,
    reminders: buildReminders(slot.startsAt),
    summary: null,
    actionItems: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  })

  return {
    ...getMessagesRecord(input.childId),
    message: 'Meeting request submitted.'
  }
}

export function updateAppointment(input: UpdateAppointmentInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  const appointment = record.appointments.find((item) => item.id === input.appointmentId)
  if (!appointment) throw new Error('Appointment not found')

  if (input.action === 'cancel') {
    appointment.status = 'cancelled'
    appointment.updatedAt = nowIso()
    const currentSlot = record.appointmentSlots.find((item) => item.participantId === appointment.participantId && item.startsAt === appointment.startsAt && item.endsAt === appointment.endsAt)
    if (currentSlot) currentSlot.available = true
    return {
      ...getMessagesRecord(input.childId),
      message: 'Appointment cancelled.'
    }
  }

  if (input.action === 'confirm') {
    appointment.status = 'confirmed'
    appointment.updatedAt = nowIso()
    return {
      ...getMessagesRecord(input.childId),
      message: 'Appointment confirmed.'
    }
  }

  const slot = input.slotId ? findSlot(record, input.slotId) : null
  if (!slot || !slot.available) throw new Error('New time slot is not available')

  const oldSlot = record.appointmentSlots.find((item) => item.participantId === appointment.participantId && item.startsAt === appointment.startsAt && item.endsAt === appointment.endsAt)
  if (oldSlot) oldSlot.available = true
  slot.available = false
  appointment.startsAt = slot.startsAt
  appointment.endsAt = slot.endsAt
  appointment.mode = slot.mode
  appointment.meetingLink = slot.mode === 'virtual' ? appointment.meetingLink ?? `https://meet.google.com/schoolos-rescheduled-${pad(Date.now() % 10000, 4)}` : null
  appointment.status = 'rescheduled'
  appointment.updatedAt = nowIso()
  appointment.reminders = buildReminders(slot.startsAt)

  return {
    ...getMessagesRecord(input.childId),
    message: 'Appointment rescheduled.'
  }
}

export function updateMessagePreferences(input: UpdatePreferencesInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Messages record not found')

  record.preferences = clonePreferences(input.preferences)
  record.preferences.whatsapp.updatedAt = nowIso()

  return {
    ...getMessagesRecord(input.childId),
    message: 'Notification preferences updated.'
  }
}

<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  CommunicationAnnouncementRecord,
  CommunicationAppointmentRecord,
  CommunicationAppointmentSlotRecord,
  CommunicationConversationRecord,
  CommunicationNotificationPreferencesRecord,
  ParentMessagesView
} from '~/shared/app/types'

const props = defineProps<{ viewModel: ParentMessagesView }>()
const emit = defineEmits<{ selectChild: [childId: string] }>()

const liveRecord = ref<{
  conversations: CommunicationConversationRecord[]
  announcements: CommunicationAnnouncementRecord[]
  appointmentSlots: CommunicationAppointmentSlotRecord[]
  appointments: CommunicationAppointmentRecord[]
  preferences: CommunicationNotificationPreferencesRecord
} | null>(null)

const feedError = ref('')
const feedLoading = ref(false)
const search = ref('')
const includeArchived = ref(false)
const selectedConversationId = ref('')
const draftMessage = ref('')
const attachmentKind = ref<'none' | 'image' | 'file' | 'voice_note' | 'pdf' | 'video'>('none')
const attachmentLabel = ref('')
const messageFeedback = ref('')
const messageFeedbackTone = ref<'success' | 'error'>('success')
const messageLoading = ref(false)

const selectedParticipantId = ref('')
const selectedSlotId = ref('')
const meetingPurpose = ref('')
const appointmentTargetId = ref('')
const rescheduleSlotId = ref('')
const appointmentFeedback = ref('')
const appointmentFeedbackTone = ref<'success' | 'error'>('success')
const appointmentLoading = ref(false)

const preferencesForm = ref<CommunicationNotificationPreferencesRecord | null>(null)
const preferencesFeedback = ref('')
const preferencesFeedbackTone = ref<'success' | 'error'>('success')
const preferencesLoading = ref(false)

watch(() => props.viewModel.activeChildId, async (childId) => {
  feedError.value = ''
  messageFeedback.value = ''
  appointmentFeedback.value = ''
  preferencesFeedback.value = ''
  await refreshMessages(childId)
}, { immediate: true })

const record = computed(() => liveRecord.value ?? {
  conversations: props.viewModel.messaging.conversations,
  announcements: props.viewModel.announcements.items,
  appointmentSlots: props.viewModel.appointments.slots,
  appointments: props.viewModel.appointments.items,
  preferences: props.viewModel.preferences.item!
})

watch(() => record.value.preferences, (value) => {
  preferencesForm.value = value ? {
    channels: { ...value.channels },
    frequency: value.frequency,
    doNotDisturbStart: value.doNotDisturbStart,
    doNotDisturbEnd: value.doNotDisturbEnd,
    whatsapp: { ...value.whatsapp }
  } : null
}, { immediate: true, deep: true })

const conversations = computed(() => record.value.conversations.filter((item) => {
  if (!includeArchived.value && item.archived) return false
  const q = search.value.trim().toLowerCase()
  if (!q) return true
  return [item.participant.fullName, item.participant.title, item.subject, item.lastMessagePreview, ...item.messages.map((row) => row.body)].join(' ').toLowerCase().includes(q)
}))

watch(conversations, (items) => {
  if (!items.find((item) => item.id === selectedConversationId.value)) {
    selectedConversationId.value = items[0]?.id ?? ''
  }
}, { immediate: true, deep: true })

const selectedConversation = computed(() => conversations.value.find((item) => item.id === selectedConversationId.value) ?? null)
const participants = computed(() => record.value.conversations.map((item) => item.participant))
watch(participants, (items) => {
  if (!items.find((item) => item.id === selectedParticipantId.value)) selectedParticipantId.value = items[0]?.id ?? ''
}, { immediate: true, deep: true })

const availableSlots = computed(() => record.value.appointmentSlots.filter((item) => item.participantId === selectedParticipantId.value && item.available))
watch(availableSlots, (items) => {
  if (!items.find((item) => item.id === selectedSlotId.value)) selectedSlotId.value = items[0]?.id ?? ''
  if (!items.find((item) => item.id === rescheduleSlotId.value)) rescheduleSlotId.value = items[0]?.id ?? ''
}, { immediate: true, deep: true })

const openAppointments = computed(() => record.value.appointments.filter((item) => item.status !== 'completed' && item.status !== 'cancelled'))
watch(openAppointments, (items) => {
  if (!items.find((item) => item.id === appointmentTargetId.value)) appointmentTargetId.value = items[0]?.id ?? ''
}, { immediate: true, deep: true })
const targetAppointment = computed(() => openAppointments.value.find((item) => item.id === appointmentTargetId.value) ?? null)
const rescheduleSlots = computed(() => record.value.appointmentSlots.filter((item) => item.participantId === targetAppointment.value?.participantId && item.available))
watch(rescheduleSlots, (items) => {
  if (!items.find((item) => item.id === rescheduleSlotId.value)) rescheduleSlotId.value = items[0]?.id ?? ''
}, { immediate: true, deep: true })

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return `${start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} ${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

async function refreshMessages(childId: string | null) {
  liveRecord.value = null
  if (!childId) return
  feedLoading.value = true
  try {
    liveRecord.value = await $fetch('/api/parent/messages/records', { query: { child: childId } })
  } catch {
    feedError.value = 'Live communication data could not be refreshed. Showing seeded records.'
    liveRecord.value = null
  } finally {
    feedLoading.value = false
  }
}

async function sendMessage() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedConversation.value || !draftMessage.value.trim()) {
    messageFeedbackTone.value = 'error'
    messageFeedback.value = 'Choose a conversation and write a message first.'
    return
  }
  messageLoading.value = true
  try {
    const payload = await $fetch('/api/parent/messages/conversations', {
      method: 'POST',
      body: { action: 'send', childId, conversationId: selectedConversation.value.id, body: draftMessage.value, attachmentKind: attachmentKind.value, attachmentLabel: attachmentLabel.value }
    })
    liveRecord.value = payload as typeof liveRecord.value
    draftMessage.value = ''
    attachmentKind.value = 'none'
    attachmentLabel.value = ''
    messageFeedbackTone.value = 'success'
    messageFeedback.value = 'Message sent successfully.'
  } catch {
    messageFeedbackTone.value = 'error'
    messageFeedback.value = 'Message could not be sent right now.'
  } finally {
    messageLoading.value = false
  }
}

async function toggleArchive(item: CommunicationConversationRecord) {
  const childId = props.viewModel.activeChildId
  if (!childId) return
  const payload = await $fetch('/api/parent/messages/conversations', {
    method: 'POST',
    body: { action: item.archived ? 'restore' : 'archive', childId, conversationId: item.id }
  })
  liveRecord.value = payload as typeof liveRecord.value
}

async function markRead(item: CommunicationAnnouncementRecord) {
  const childId = props.viewModel.activeChildId
  if (!childId || item.read) return
  const payload = await $fetch('/api/parent/messages/announcements', {
    method: 'POST',
    body: { childId, announcementId: item.id }
  })
  liveRecord.value = payload as typeof liveRecord.value
}

async function requestMeeting() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedParticipantId.value || !selectedSlotId.value || !meetingPurpose.value.trim()) {
    appointmentFeedbackTone.value = 'error'
    appointmentFeedback.value = 'Choose a participant, slot, and purpose first.'
    return
  }
  appointmentLoading.value = true
  try {
    const payload = await $fetch('/api/parent/messages/appointments', {
      method: 'POST',
      body: { action: 'request', childId, participantId: selectedParticipantId.value, slotId: selectedSlotId.value, purpose: meetingPurpose.value }
    })
    liveRecord.value = payload as typeof liveRecord.value
    meetingPurpose.value = ''
    appointmentFeedbackTone.value = 'success'
    appointmentFeedback.value = 'Meeting request submitted.'
  } catch {
    appointmentFeedbackTone.value = 'error'
    appointmentFeedback.value = 'Meeting request could not be submitted.'
  } finally {
    appointmentLoading.value = false
  }
}

async function updateAppointment(action: 'confirm' | 'reschedule' | 'cancel') {
  const childId = props.viewModel.activeChildId
  if (!childId || !appointmentTargetId.value) return
  const payload = await $fetch('/api/parent/messages/appointments', {
    method: 'POST',
    body: { action, childId, appointmentId: appointmentTargetId.value, slotId: action === 'reschedule' ? rescheduleSlotId.value : undefined }
  })
  liveRecord.value = payload as typeof liveRecord.value
  appointmentFeedbackTone.value = 'success'
  appointmentFeedback.value = action === 'confirm' ? 'Appointment confirmed.' : action === 'cancel' ? 'Appointment cancelled.' : 'Appointment rescheduled.'
}

async function savePreferences() {
  const childId = props.viewModel.activeChildId
  if (!childId || !preferencesForm.value) return
  preferencesLoading.value = true
  try {
    const payload = await $fetch('/api/parent/messages/preferences', {
      method: 'POST',
      body: { childId, preferences: preferencesForm.value }
    })
    liveRecord.value = payload as typeof liveRecord.value
    preferencesFeedbackTone.value = 'success'
    preferencesFeedback.value = 'Notification preferences updated.'
  } catch {
    preferencesFeedbackTone.value = 'error'
    preferencesFeedback.value = 'Preferences could not be saved right now.'
  } finally {
    preferencesLoading.value = false
  }
}
</script>

<template>
  <div>
    <motion.section class="dashboard-hero-card" :initial="{ opacity: 0, y: 18 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.35 }">
      <template v-if="props.viewModel.activeChild">
        <div class="dashboard-hero-card__media"><div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div></div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">VIP communication</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} - {{ props.viewModel.activeChild.gradeLabel }} - {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ record.conversations.length }} conversations</span>
            <span>{{ record.announcements.filter((item) => !item.read).length }} unread announcements</span>
            <span>{{ record.appointments.length }} appointments</span>
          </div>
          <p class="dashboard-hero-card__highlight">Direct messages, emergency alerts, meeting booking, WhatsApp routing, and notification controls in one space.</p>
        </div>
        <div class="dashboard-hero-card__switcher">
          <p class="eyebrow">Switch child</p>
          <div class="child-switcher">
            <button v-for="child in props.viewModel.childTabs" :key="child.id" class="child-switcher__button" :class="{ 'child-switcher__button--active': child.isActive }" type="button" @click="emit('selectChild', child.id)">
              <span class="child-switcher__avatar">{{ child.initials }}</span>
              <span><strong>{{ child.fullName }}</strong><small>{{ child.gradeLabel }} - {{ child.schoolName }}</small></span>
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="hero-summary hero-summary--single"><article class="hero-summary__card"><p class="eyebrow">VIP communication</p><h3>No communication profile linked yet</h3><p>Once a child profile is linked, direct messages, announcements, meetings, WhatsApp alerts, and notification preferences will appear here.</p></article></div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy"><p class="eyebrow">At a glance</p><h2>Communication pulse</h2><p>Conversations, notices, meetings, and delivery settings stay visible in one dashboard.</p></div>
      <div class="stat-grid stat-grid--four"><article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase"><p class="eyebrow">{{ stat.label }}</p><h3>{{ stat.value }}</h3><p>{{ stat.detail }}</p></article></div>
      <p v-if="feedError" class="form-message form-message--error">{{ feedError }}</p>
      <p v-else-if="feedLoading" class="module-note">Refreshing communication records...</p>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">9.1 In-app messaging</p><h2>Direct messaging and search</h2><p>Message teachers, administration, director, supervisor, and counselor with text, files, images, and voice-note placeholders.</p></div>
        <label class="field-stack"><span>Search</span><input v-model="search" type="text" class="input-textarea input-textarea--single" placeholder="Search conversations" /></label>
        <label class="checkbox-row"><input v-model="includeArchived" type="checkbox" /><span>Include archived conversations</span></label>
        <div class="stack" style="margin-top: 16px;">
          <article v-for="item in conversations" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div><h3>{{ item.participant.fullName }}</h3><p>{{ item.participant.title }}</p></div>
              <span class="status-pill status-pill--neutral">{{ item.archived ? 'Archived' : 'Active' }}</span>
            </div>
            <p>{{ item.subject }}</p>
            <small>{{ item.lastMessagePreview }}</small>
            <div class="summary-strip summary-strip--muted" style="margin-top: 12px;"><span>Avg response {{ item.participant.averageResponseHours.toFixed(1) }}h</span><span>{{ item.participant.officeHours }}</span></div>
            <div class="pill-row" style="margin-top: 12px;"><button class="button button--secondary" type="button" @click="selectedConversationId = item.id">Open</button><button class="button button--secondary" type="button" @click="toggleArchive(item)">{{ item.archived ? 'Restore' : 'Archive' }}</button></div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">Conversation thread</p><h2>{{ selectedConversation?.participant.fullName ?? 'Select a thread' }}</h2><p v-if="selectedConversation">{{ selectedConversation.participant.availabilityNote }}</p></div>
        <div v-if="selectedConversation" class="stack">
          <article v-for="item in selectedConversation.messages" :key="item.id" class="list-card">
            <div class="list-card__header"><div><h3>{{ item.senderName }}</h3><p>{{ formatTimestamp(item.sentAt) }}</p></div><span class="status-pill status-pill--neutral">{{ item.seenAt ? 'Seen' : 'Delivered' }}</span></div>
            <p>{{ item.body }}</p>
            <div v-if="item.attachments.length" class="pill-row"><a v-for="asset in item.attachments" :key="asset.id" class="asset-pill" :href="asset.url">{{ asset.kind }} - {{ asset.label }}</a></div>
          </article>
          <label class="field-stack"><span>Reply</span><textarea v-model="draftMessage" class="input-textarea" rows="4" placeholder="Write your message"></textarea></label>
          <label class="field-stack"><span>Attachment type</span><select v-model="attachmentKind" class="input-select"><option value="none">No attachment</option><option value="image">Image</option><option value="file">File</option><option value="voice_note">Voice note</option><option value="pdf">PDF</option><option value="video">Video</option></select></label>
          <label v-if="attachmentKind !== 'none'" class="field-stack"><span>Attachment label</span><input v-model="attachmentLabel" type="text" class="input-textarea input-textarea--single" placeholder="Attachment name" /></label>
          <button class="button button--primary" type="button" :disabled="messageLoading" @click="sendMessage">{{ messageLoading ? 'Sending...' : 'Send message' }}</button>
          <p v-if="messageFeedback" class="form-message" :class="{ 'form-message--error': messageFeedbackTone === 'error' }">{{ messageFeedback }}</p>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy"><p class="eyebrow">9.2 Announcements</p><h2>Pinned notices and emergency alerts</h2><p>School-wide, class, personal, and emergency posts support media attachments and read confirmation.</p></div>
      <div class="subject-grid">
        <article v-for="item in record.announcements" :key="item.id" class="subject-card">
          <div class="subject-card__header"><div><p class="eyebrow">{{ item.targetLabel }}</p><h3>{{ item.title }}</h3></div><span class="status-pill status-pill--neutral">{{ item.scope }}</span></div>
          <p>{{ item.body }}</p>
          <small>{{ formatTimestamp(item.createdAt) }}{{ item.pinned ? ' - pinned' : '' }}</small>
          <div v-if="item.attachments.length" class="pill-row" style="margin-top: 12px;"><a v-for="asset in item.attachments" :key="asset.id" class="asset-pill" :href="asset.url">{{ asset.kind }} - {{ asset.label }}</a></div>
          <div class="pill-row" style="margin-top: 12px;"><button class="button button--secondary" type="button" :disabled="item.read" @click="markRead(item)">{{ item.read ? 'Marked as read' : 'Mark as read' }}</button></div>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">9.3 Appointments / meetings</p><h2>Book, confirm, reschedule, cancel</h2><p>Use available teacher or director slots, get reminders 1 day and 1 hour before, and keep links and summaries attached.</p></div>
        <label class="field-stack"><span>Participant</span><select v-model="selectedParticipantId" class="input-select"><option v-for="item in participants" :key="item.id" :value="item.id">{{ item.fullName }} - {{ item.title }}</option></select></label>
        <label class="field-stack"><span>Available slot</span><select v-model="selectedSlotId" class="input-select"><option v-for="item in availableSlots" :key="item.id" :value="item.id">{{ formatRange(item.startsAt, item.endsAt) }} - {{ item.mode }}</option></select></label>
        <label class="field-stack"><span>Meeting purpose</span><textarea v-model="meetingPurpose" class="input-textarea" rows="3" placeholder="What would you like to discuss?"></textarea></label>
        <button class="button button--primary" type="button" :disabled="appointmentLoading" @click="requestMeeting">{{ appointmentLoading ? 'Submitting...' : 'Request meeting' }}</button>
        <div v-if="openAppointments.length" class="stack" style="margin-top: 18px;">
          <label class="field-stack"><span>Manage appointment</span><select v-model="appointmentTargetId" class="input-select"><option v-for="item in openAppointments" :key="item.id" :value="item.id">{{ item.participantLabel }} - {{ item.status }}</option></select></label>
          <label class="field-stack"><span>Reschedule to slot</span><select v-model="rescheduleSlotId" class="input-select"><option v-for="item in rescheduleSlots" :key="item.id" :value="item.id">{{ formatRange(item.startsAt, item.endsAt) }} - {{ item.mode }}</option></select></label>
          <div class="pill-row"><button class="button button--secondary" type="button" @click="updateAppointment('confirm')">Confirm</button><button class="button button--secondary" type="button" @click="updateAppointment('reschedule')">Reschedule</button><button class="button button--secondary" type="button" @click="updateAppointment('cancel')">Cancel</button></div>
        </div>
        <p v-if="appointmentFeedback" class="form-message" :class="{ 'form-message--error': appointmentFeedbackTone === 'error' }">{{ appointmentFeedback }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">Meeting records</p><h2>Links, summaries, and action items</h2><p>Virtual links, reminder cadence, summaries, and follow-up items remain visible after the meeting.</p></div>
        <div class="stack">
          <article v-for="item in record.appointments" :key="item.id" class="list-card">
            <div class="list-card__header"><div><h3>{{ item.participantLabel }}</h3><p>{{ formatRange(item.startsAt, item.endsAt) }}</p></div><span class="status-pill status-pill--neutral">{{ item.status }}</span></div>
            <p>{{ item.purpose }}</p>
            <small>{{ item.mode }}{{ item.meetingLink ? ` - ${item.meetingLink}` : '' }}</small>
            <p v-if="item.summary" class="module-note">{{ item.summary }}</p>
            <ul v-if="item.actionItems.length" class="plain-list plain-list--tight"><li v-for="actionItem in item.actionItems" :key="actionItem">{{ actionItem }}</li></ul>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">9.4 WhatsApp integration</p><h2>Critical routing by WhatsApp</h2><p>Choose whether invoice reminders, emergency alerts, absence notices, and bus tracking links can route to WhatsApp.</p></div>
        <template v-if="preferencesForm">
          <label class="checkbox-row"><input v-model="preferencesForm.whatsapp.optIn" type="checkbox" /><span>Opt in to WhatsApp</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.whatsapp.invoiceReminders" type="checkbox" /><span>Invoice reminders</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.whatsapp.emergencyAlerts" type="checkbox" /><span>Emergency alerts</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.whatsapp.absenceNotifications" type="checkbox" /><span>Absence notifications</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.whatsapp.busTrackingLink" type="checkbox" /><span>Bus tracking links</span></label>
        </template>
      </section>

      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">9.5 Notification preferences</p><h2>Channels, frequency, and quiet hours</h2><p>Control push, email, SMS, WhatsApp, digest cadence, and do-not-disturb hours.</p></div>
        <template v-if="preferencesForm">
          <label class="checkbox-row"><input v-model="preferencesForm.channels.push" type="checkbox" /><span>Push</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.channels.email" type="checkbox" /><span>Email</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.channels.sms" type="checkbox" /><span>SMS</span></label>
          <label class="checkbox-row"><input v-model="preferencesForm.channels.whatsapp" type="checkbox" /><span>WhatsApp</span></label>
          <label class="field-stack"><span>Frequency</span><select v-model="preferencesForm.frequency" class="input-select"><option value="instant">Instant</option><option value="daily_digest">Daily digest</option><option value="weekly">Weekly</option></select></label>
          <label class="field-stack"><span>Do not disturb start</span><input v-model="preferencesForm.doNotDisturbStart" type="time" class="input-textarea input-textarea--single" /></label>
          <label class="field-stack"><span>Do not disturb end</span><input v-model="preferencesForm.doNotDisturbEnd" type="time" class="input-textarea input-textarea--single" /></label>
          <button class="button button--primary" type="button" :disabled="preferencesLoading" @click="savePreferences">{{ preferencesLoading ? 'Saving...' : 'Save preferences' }}</button>
          <p v-if="preferencesFeedback" class="form-message" :class="{ 'form-message--error': preferencesFeedbackTone === 'error' }">{{ preferencesFeedback }}</p>
        </template>
      </section>
    </section>
  </div>
</template>

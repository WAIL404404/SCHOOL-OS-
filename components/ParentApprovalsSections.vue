<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  ApprovalReminderRecord,
  ApprovalRequestRecord,
  ApprovalSignatureLogRecord,
  ApprovalType,
  ParentApprovalsView
} from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentApprovalsView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const approvalTypeCards: Array<{ type: ApprovalType; title: string; detail: string }> = [
  { type: 'field_trip', title: 'Field trip permission', detail: 'Approve outings, travel, supervision, and event participation.' },
  { type: 'photo_video', title: 'Photography / video consent', detail: 'Control school-managed media use across newsletters and family channels.' },
  { type: 'early_dismissal', title: 'Early dismissal authorization', detail: 'Authorize one-off release before standard dismissal time.' },
  { type: 'medical_treatment', title: 'Emergency medical treatment consent', detail: 'Allow urgent care escalation with immediate family notification.' },
  { type: 'competition_event', title: 'Competition / event participation', detail: 'Approve contests, performances, and supervised event travel.' },
  { type: 'alternative_pickup', title: 'Alternative pick-up authorization', detail: 'Authorize a backup adult for dismissal with ID verification.' },
  { type: 'special_diet', title: 'Special diet / food restrictions', detail: 'Keep cafeteria and trip teams aligned on nutrition rules and allergies.' },
  { type: 'internet_policy', title: 'Internet usage policy', detail: 'Approve supervised access to learning platforms and managed devices.' },
  { type: 'data_sharing', title: 'Data sharing consent', detail: 'Control secure student data sharing between school teams or campuses.' },
  { type: 'after_school_enrollment', title: 'After-school activity enrollment', detail: 'Approve extra-curricular participation directly from the parent app.' }
]

const liveRecord = ref<{
  items: ApprovalRequestRecord[]
  signatureLog: ApprovalSignatureLogRecord[]
  flowNote: string
  archiveNote: string
} | null>(null)

const approvalsLoading = ref(false)
const approvalsError = ref('')
const selectedApprovalId = ref('')
const actionLoading = ref(false)
const actionFeedback = ref('')
const actionFeedbackTone = ref<'success' | 'error'>('success')
const revocationReason = ref('')

const historyTypeFilter = ref<'all' | ApprovalType>('all')
const historyStatusFilter = ref<'all' | ApprovalRequestRecord['status']>('all')
const historyDateFilter = ref<'all' | '30' | '90' | '365'>('all')

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    approvalsError.value = ''
    actionFeedback.value = ''
    revocationReason.value = ''
    historyTypeFilter.value = 'all'
    historyStatusFilter.value = 'all'
    historyDateFilter.value = 'all'
    void refreshApprovals(childId)
  },
  { immediate: true }
)

const approvalRecord = computed(() => liveRecord.value ?? {
  items: props.viewModel.current.items,
  signatureLog: props.viewModel.current.signatureLog,
  flowNote: props.viewModel.current.flowNote,
  archiveNote: props.viewModel.history.archiveNote
})

const currentItems = computed(() => approvalRecord.value.items)
const historyItems = computed(() => [...approvalRecord.value.items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()))
const reminderItems = computed<ApprovalReminderRecord[]>(() =>
  currentItems.value.flatMap((item) => item.reminders).sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())
)
const pendingCount = computed(() => currentItems.value.filter((item) => item.status === 'pending').length)
const signedCount = computed(() => currentItems.value.filter((item) => item.status === 'signed').length)

watch(
  currentItems,
  (items) => {
    const target = items.find((item) => item.id === selectedApprovalId.value)
    if (target) return
    const firstPending = items.find((item) => item.status === 'pending')
    selectedApprovalId.value = firstPending?.id ?? items[0]?.id ?? ''
  },
  { immediate: true, deep: true }
)

const selectedApproval = computed(() => currentItems.value.find((item) => item.id === selectedApprovalId.value) ?? null)

const filteredHistory = computed(() => {
  const now = Date.now()
  return historyItems.value.filter((item) => {
    if (historyTypeFilter.value !== 'all' && item.type !== historyTypeFilter.value) return false
    if (historyStatusFilter.value !== 'all' && item.status !== historyStatusFilter.value) return false
    if (historyDateFilter.value !== 'all') {
      const days = Number(historyDateFilter.value)
      const ageMs = now - new Date(item.updatedAt).getTime()
      if (ageMs > days * 24 * 60 * 60 * 1000) return false
    }
    return true
  })
})

function approvalTypeLabel(type: ApprovalType) {
  return approvalTypeCards.find((item) => item.type === type)?.title ?? type
}

function statusClass(status: ApprovalRequestRecord['status']) {
  if (status === 'signed') return 'status-pill'
  if (status === 'pending') return 'status-pill status-pill--warning'
  if (status === 'revoked') return 'status-pill status-pill--alert'
  return 'status-pill status-pill--neutral'
}

function reminderClass(status: ApprovalReminderRecord['status']) {
  return status === 'sent' ? 'status-pill status-pill--neutral' : 'status-pill status-pill--warning'
}

function logClass(action: ApprovalSignatureLogRecord['action']) {
  return action === 'revoked' ? 'alert-item alert-item--warning' : 'alert-item alert-item--info'
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDate(value: string | null) {
  if (!value) return 'Not event-based'
  return new Date(value).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function refreshApprovals(childId: string | null) {
  liveRecord.value = null
  if (!childId) return

  approvalsLoading.value = true
  approvalsError.value = ''
  try {
    liveRecord.value = await $fetch<{
      items: ApprovalRequestRecord[]
      signatureLog: ApprovalSignatureLogRecord[]
      flowNote: string
      archiveNote: string
    }>('/api/parent/approvals/records', {
      query: { child: childId }
    })
  } catch {
    approvalsError.value = 'Live approvals data could not be refreshed. Showing seeded records.'
    liveRecord.value = null
  } finally {
    approvalsLoading.value = false
  }
}

async function signSelectedApproval() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedApproval.value) {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'No approval is selected.'
    return
  }

  actionLoading.value = true
  actionFeedback.value = ''
  try {
    const payload = await $fetch<{
      items: ApprovalRequestRecord[]
      signatureLog: ApprovalSignatureLogRecord[]
      flowNote: string
      archiveNote: string
      message: string
    }>('/api/parent/approvals/actions', {
      method: 'POST',
      body: {
        action: 'sign',
        childId,
        approvalId: selectedApproval.value.id
      }
    })

    liveRecord.value = payload
    actionFeedbackTone.value = 'success'
    actionFeedback.value = payload.message
  } catch {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Signature could not be recorded right now.'
  } finally {
    actionLoading.value = false
  }
}

async function revokeSelectedApproval() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedApproval.value) {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'No approval is selected.'
    return
  }
  if (!revocationReason.value.trim()) {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Add a short revocation reason before continuing.'
    return
  }

  actionLoading.value = true
  actionFeedback.value = ''
  try {
    const payload = await $fetch<{
      items: ApprovalRequestRecord[]
      signatureLog: ApprovalSignatureLogRecord[]
      flowNote: string
      archiveNote: string
      message: string
    }>('/api/parent/approvals/actions', {
      method: 'POST',
      body: {
        action: 'revoke',
        childId,
        approvalId: selectedApproval.value.id,
        reason: revocationReason.value
      }
    })

    liveRecord.value = payload
    actionFeedbackTone.value = 'success'
    actionFeedback.value = payload.message
    revocationReason.value = ''
  } catch {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Revocation could not be completed right now.'
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div>
    <motion.section
      class="dashboard-hero-card"
      :initial="{ opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35 }"
    >
      <template v-if="props.viewModel.activeChild">
        <div class="dashboard-hero-card__media">
          <div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div>
        </div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">Parent approvals and permissions</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} - {{ props.viewModel.activeChild.gradeLabel }} - {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ pendingCount }} pending</span>
            <span>{{ signedCount }} signed</span>
            <span>{{ historyItems.length }} archived records</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ approvalRecord.flowNote }}</p>
        </div>
        <div class="dashboard-hero-card__switcher">
          <p class="eyebrow">Switch child</p>
          <div class="child-switcher">
            <button
              v-for="child in props.viewModel.childTabs"
              :key="child.id"
              class="child-switcher__button"
              :class="{ 'child-switcher__button--active': child.isActive }"
              type="button"
              @click="emit('selectChild', child.id)"
            >
              <span class="child-switcher__avatar">{{ child.initials }}</span>
              <span>
                <strong>{{ child.fullName }}</strong>
                <small>{{ child.gradeLabel }} - {{ child.schoolName }}</small>
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="hero-summary hero-summary--single">
          <article class="hero-summary__card">
            <p class="eyebrow">Parent approvals and permissions</p>
            <h3>No approvals profile linked yet</h3>
            <p>As soon as a child profile is linked, permission requests, digital signatures, reminders, and approval history will appear here.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Approval pulse</h2>
        <p>Request volume, signature progress, reminder automation, and revocation windows stay visible in one place.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="approvalsError" class="form-message form-message--error">{{ approvalsError }}</p>
      <p v-else-if="approvalsLoading" class="module-note">Refreshing approvals and signature history...</p>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">8.1 Types of approvals</p>
        <h2>Permission categories supported in the parent app</h2>
        <p>All high-trust school authorizations can be requested, signed, archived, and reviewed in one workflow.</p>
      </div>
      <div class="subject-grid">
        <article v-for="item in approvalTypeCards" :key="item.type" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">Approval type</p>
              <h3>{{ item.title }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ item.type.replace(/_/g, ' ') }}</span>
          </div>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">8.2 Approval flow</p>
          <h2>Details, attachments, signature, and instant confirmation</h2>
          <p>Open any request, review attached files, sign digitally, and generate the archived PDF immediately.</p>
        </div>

        <label class="field-stack">
          <span>Select approval</span>
          <select v-model="selectedApprovalId" class="input-select">
            <option v-for="item in currentItems" :key="item.id" :value="item.id">
              {{ approvalTypeLabel(item.type) }} - {{ item.status }} - {{ item.title }}
            </option>
          </select>
        </label>

        <template v-if="selectedApproval">
          <div class="list-card" style="margin-top: 16px;">
            <div class="list-card__header">
              <div>
                <h3>{{ selectedApproval.title }}</h3>
                <p>{{ approvalTypeLabel(selectedApproval.type) }}</p>
              </div>
              <span :class="statusClass(selectedApproval.status)">{{ selectedApproval.status }}</span>
            </div>
            <p>{{ selectedApproval.summary }}</p>
            <p>{{ selectedApproval.detail }}</p>
            <small>Requested by {{ selectedApproval.requestedBy }} on {{ formatTimestamp(selectedApproval.requestedAt) }}</small>
            <div class="summary-strip summary-strip--muted" style="margin-top: 12px;">
              <span>Event: {{ formatDate(selectedApproval.eventDate) }}</span>
              <span>{{ selectedApproval.signatureRequired ? 'Digital signature required' : 'No signature required' }}</span>
            </div>
            <p class="module-note">{{ selectedApproval.schoolConfirmation }}</p>
            <p class="module-note">{{ selectedApproval.revokePolicy }}</p>
            <div class="pill-row" style="margin-top: 12px;">
              <a v-for="item in selectedApproval.attachments" :key="item.id" class="asset-pill" :href="item.url" :target="item.kind === 'link' ? '_blank' : undefined" :rel="item.kind === 'link' ? 'noreferrer' : undefined">{{ item.label }}</a>
              <a class="asset-pill" :href="selectedApproval.pdfUrl">Approval PDF</a>
            </div>
          </div>

          <div class="pill-row" style="margin-top: 16px;">
            <button class="button button--primary" type="button" :disabled="actionLoading || selectedApproval.status !== 'pending'" @click="signSelectedApproval">
              {{ actionLoading && selectedApproval.status === 'pending' ? 'Signing...' : 'Sign approval' }}
            </button>
          </div>

          <div v-if="selectedApproval.status === 'signed' && selectedApproval.canRevoke" class="stack" style="margin-top: 18px;">
            <label class="field-stack">
              <span>Revocation reason</span>
              <textarea v-model="revocationReason" class="input-textarea" rows="3" placeholder="Explain why you want to revoke this consent."></textarea>
            </label>
            <button class="button button--secondary" type="button" :disabled="actionLoading" @click="revokeSelectedApproval">
              {{ actionLoading ? 'Processing...' : 'Revoke consent' }}
            </button>
          </div>
        </template>

        <p v-if="actionFeedback" class="form-message" :class="{ 'form-message--error': actionFeedbackTone === 'error' }">{{ actionFeedback }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Signature and reminder trace</p>
          <h2>Timestamp, device, school confirmation</h2>
          <p>Every action is logged with timestamp, IP, and device details. Unsigned requests follow the reminder cadence automatically.</p>
        </div>

        <div class="stack stack--compact">
          <article v-for="item in reminderItems" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.triggerHoursAfter }}h reminder</h3>
                <p>{{ formatTimestamp(item.scheduledFor) }}</p>
              </div>
              <span :class="reminderClass(item.status)">{{ item.status }}</span>
            </div>
          </article>
        </div>

        <div class="stack stack--compact" style="margin-top: 18px;">
          <article v-for="item in approvalRecord.signatureLog" :key="item.id" :class="logClass(item.action)">
            <div class="alert-item__icon">{{ item.action === 'signed' ? 'i' : '!' }}</div>
            <div>
              <h3>{{ item.action }} - {{ item.actorName }}</h3>
              <p>{{ formatTimestamp(item.actedAt) }} - {{ item.deviceInfo }}</p>
              <small>IP {{ item.ipAddress }}</small>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">8.3 Approval history</p>
        <h2>Filter by type, date, and status</h2>
        <p>All approval history stays searchable, downloadable, and revocable when policy conditions still allow it.</p>
      </div>
      <p class="module-note">{{ approvalRecord.archiveNote }}</p>

      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <label class="field-stack">
            <span>Filter by type</span>
            <select v-model="historyTypeFilter" class="input-select">
              <option value="all">All types</option>
              <option v-for="item in approvalTypeCards" :key="item.type" :value="item.type">{{ item.title }}</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Filter by status</span>
            <select v-model="historyStatusFilter" class="input-select">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Filter by date</span>
            <select v-model="historyDateFilter" class="input-select">
              <option value="all">All time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
            </select>
          </label>
        </article>

        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Filtered results</p>
            <h3>{{ filteredHistory.length }} approval record(s)</h3>
          </div>
          <div class="stack">
            <article v-for="item in filteredHistory" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ approvalTypeLabel(item.type) }}</p>
                </div>
                <span :class="statusClass(item.status)">{{ item.status }}</span>
              </div>
              <p>{{ item.summary }}</p>
              <small>Updated {{ formatTimestamp(item.updatedAt) }}</small>
              <div class="pill-row" style="margin-top: 12px;">
                <a class="asset-pill" :href="item.pdfUrl">Download PDF</a>
                <span v-if="item.canRevoke && item.status === 'signed'" class="asset-pill">Revocable until {{ formatDate(item.revokeDeadline) }}</span>
              </div>
            </article>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

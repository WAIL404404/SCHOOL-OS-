<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  ContractAlertRecord,
  ContractReEnrollmentRecord,
  ContractSignatureLogRecord,
  ContractSignerStatusView,
  ParentContractsView
} from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentContractsView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const selectedSignerRole = ref<'parent_1' | 'parent_2'>('parent_1')
const signatureFeedback = ref('')
const signatureFeedbackTone = ref<'success' | 'error'>('success')
const signatureLoading = ref(false)

const reenrollmentFeedback = ref('')
const reenrollmentFeedbackTone = ref<'success' | 'error'>('success')
const reenrollmentLoading = ref(false)
const requestSeatReservation = ref(true)
const applyEarlyBird = ref(true)
const selectedFiles = ref<string[]>([])

const liveSigners = ref<ContractSignerStatusView[]>([])
const liveSignatureLog = ref<ContractSignatureLogRecord[]>([])
const liveReEnrollment = ref<ContractReEnrollmentRecord | null>(null)
const contractsFeedLoading = ref(false)
const contractsFeedError = ref('')

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    signatureFeedback.value = ''
    reenrollmentFeedback.value = ''
    contractsFeedError.value = ''
    selectedFiles.value = []
    void refreshContractsFeed(childId)
  },
  { immediate: true }
)

const signerStatuses = computed(() => (liveSigners.value.length ? liveSigners.value : props.viewModel.digitalSignature.signers))
const signatureLog = computed(() => (liveSignatureLog.value.length ? liveSignatureLog.value : props.viewModel.digitalSignature.signatureLog))
const reEnrollment = computed(() => liveReEnrollment.value ?? props.viewModel.reEnrollment)
const pendingSignerCount = computed(() => signerStatuses.value.filter((item) => item.status === 'pending').length)

watch(
  signerStatuses,
  (items) => {
    const firstPending = items.find((item) => item.status === 'pending')
    if (firstPending) selectedSignerRole.value = firstPending.roleId
  },
  { immediate: true }
)

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatMad(amount: number | null) {
  if (amount === null) return 'Not applicable'
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

function signerStatusClass(status: 'signed' | 'pending') {
  return status === 'signed' ? 'status-pill' : 'status-pill status-pill--warning'
}

function reEnrollmentStatusClass(status: ContractReEnrollmentRecord['status']) {
  if (status === 'confirmed') return 'status-pill'
  if (status === 'under_review') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function reEnrollmentStatusLabel(status: ContractReEnrollmentRecord['status']) {
  if (status === 'under_review') return 'Under review'
  if (status === 'confirmed') return 'Confirmed'
  return 'Submitted'
}

function alertClass(item: ContractAlertRecord) {
  if (item.type === 'ready_to_sign') return 'alert-item alert-item--info'
  if (item.type === 'unsigned_7_days') return 'alert-item alert-item--warning'
  return 'alert-item alert-item--calm'
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFiles.value = Array.from(input.files ?? []).map((file) => file.name)
}

async function refreshContractsFeed(childId: string | null) {
  if (!childId) {
    liveSigners.value = []
    liveSignatureLog.value = []
    liveReEnrollment.value = null
    return
  }

  contractsFeedLoading.value = true
  contractsFeedError.value = ''
  try {
    const [signaturePayload, reEnrollmentPayload] = await Promise.all([
      $fetch<{ signers: ContractSignerStatusView[]; log: ContractSignatureLogRecord[] }>('/api/parent/contracts/signatures', { query: { child: childId } }),
      $fetch<{ item: ContractReEnrollmentRecord | null }>('/api/parent/contracts/reenrollment', { query: { child: childId } })
    ])
    liveSigners.value = signaturePayload.signers
    liveSignatureLog.value = signaturePayload.log
    liveReEnrollment.value = reEnrollmentPayload.item
  } catch {
    contractsFeedError.value = 'Live contract data could not be refreshed. Showing seeded records.'
    liveSigners.value = []
    liveSignatureLog.value = []
    liveReEnrollment.value = null
  } finally {
    contractsFeedLoading.value = false
  }
}

async function signContract() {
  const childId = props.viewModel.activeChildId
  if (!childId || !props.viewModel.currentContract) {
    signatureFeedbackTone.value = 'error'
    signatureFeedback.value = 'No active contract is available for signature.'
    return
  }

  signatureLoading.value = true
  signatureFeedback.value = ''
  try {
    const payload = await $fetch<{
      signers: ContractSignerStatusView[]
      log: ContractSignatureLogRecord[]
      message: string
    }>('/api/parent/contracts/signatures', {
      method: 'POST',
      body: {
        childId,
        roleId: selectedSignerRole.value
      }
    })

    liveSigners.value = payload.signers
    liveSignatureLog.value = payload.log
    signatureFeedbackTone.value = 'success'
    signatureFeedback.value = payload.message
  } catch {
    signatureFeedbackTone.value = 'error'
    signatureFeedback.value = 'Signature could not be recorded right now. Please try again.'
  } finally {
    signatureLoading.value = false
  }
}

async function submitReEnrollment() {
  const childId = props.viewModel.activeChildId
  if (!childId || !reEnrollment.value) {
    reenrollmentFeedbackTone.value = 'error'
    reenrollmentFeedback.value = 'No re-enrollment record is available for this child.'
    return
  }

  reenrollmentLoading.value = true
  reenrollmentFeedback.value = ''
  try {
    const payload = await $fetch<{
      item: ContractReEnrollmentRecord
      message: string
    }>('/api/parent/contracts/reenrollment', {
      method: 'POST',
      body: {
        childId,
        requestSeatReservation: requestSeatReservation.value,
        applyEarlyBird: applyEarlyBird.value,
        uploadedFiles: selectedFiles.value
      }
    })

    liveReEnrollment.value = payload.item
    reenrollmentFeedbackTone.value = 'success'
    reenrollmentFeedback.value = payload.message
    selectedFiles.value = []
  } catch {
    reenrollmentFeedbackTone.value = 'error'
    reenrollmentFeedback.value = 'Re-enrollment request could not be submitted right now.'
  } finally {
    reenrollmentLoading.value = false
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
      <template v-if="props.viewModel.activeChild && props.viewModel.currentContract">
        <div class="dashboard-hero-card__media">
          <div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div>
        </div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">Contracts and enrollment</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ props.viewModel.currentContract.contractRef }}</span>
            <span>Renewal {{ formatDate(props.viewModel.currentContract.renewalDate) }}</span>
            <span>{{ signerStatuses.filter((item) => item.status === 'signed').length }}/{{ signerStatuses.length }} signatures</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ props.viewModel.currentContract.cancellationPolicy }}</p>
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
                <small>{{ child.gradeLabel }} · {{ child.schoolName }}</small>
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="hero-summary hero-summary--single">
          <article class="hero-summary__card">
            <p class="eyebrow">Contracts and enrollment</p>
            <h3>No contract profile linked yet</h3>
            <p>Once a student profile is linked, contract details, signatures, and re-enrollment workflow will appear here.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Contract pulse</h2>
        <p>Contract validity, signature completion, and renewal readiness stay visible in one place.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="contractsFeedError" class="form-message form-message--error">{{ contractsFeedError }}</p>
      <p v-else-if="contractsFeedLoading" class="module-note">Refreshing contract and signature status...</p>
    </section>

    <section class="section-block" v-if="props.viewModel.currentContract">
      <div class="section-copy">
        <p class="eyebrow">5.1 Current contract</p>
        <h2>Contract terms, coverage, and renewal timeline</h2>
        <p>Review the complete enrollment agreement, what's included, and key dates before renewal.</p>
      </div>
      <div class="summary-strip summary-strip--muted">
        <span>Start {{ formatDate(props.viewModel.currentContract.startsAt) }}</span>
        <span>End {{ formatDate(props.viewModel.currentContract.endsAt) }}</span>
        <span>Renewal by {{ formatDate(props.viewModel.currentContract.renewalDate) }}</span>
      </div>
      <div class="pill-row" style="margin-top: 12px;">
        <a class="asset-pill" :href="props.viewModel.currentContract.fullContractUrl">View full contract PDF</a>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Terms and conditions</p>
            <h3>Key legal clauses</h3>
          </div>
          <div class="stack">
            <article v-for="term in props.viewModel.currentContract.terms" :key="term.id" class="list-card">
              <h3>{{ term.title }}</h3>
              <p>{{ term.detail }}</p>
            </article>
          </div>
        </article>
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Coverage</p>
            <h3>What's covered vs extra</h3>
          </div>
          <div class="stack">
            <article v-for="coverage in props.viewModel.currentContract.coverage" :key="coverage.id" class="list-card">
              <div class="list-card__header">
                <h3>{{ coverage.label }}</h3>
                <span :class="coverage.included ? 'status-pill' : 'status-pill status-pill--warning'">{{ coverage.included ? 'Covered' : 'Extra' }}</span>
              </div>
              <p>{{ coverage.detail }}</p>
            </article>
          </div>
          <p class="module-note">{{ props.viewModel.currentContract.cancellationPolicy }}</p>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">5.2 Digital signature</p>
          <h2>Sign contracts directly in-app</h2>
          <p>Timestamp and IP logging are tracked for legal compliance. Both parents can co-sign from the app.</p>
        </div>
        <p class="module-note">{{ props.viewModel.digitalSignature.legalNote }}</p>
        <div class="stack">
          <article v-for="signer in signerStatuses" :key="signer.roleId" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ signer.label }} · {{ signer.fullName }}</h3>
                <p v-if="signer.signedAt">Signed {{ formatTimestamp(signer.signedAt) }} · IP {{ signer.ipAddress }}</p>
                <p v-else>Awaiting signature</p>
              </div>
              <span :class="signerStatusClass(signer.status)">{{ signer.status }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Co-sign workflow</p>
          <h2>Record a new signature</h2>
          <p>Unsigned parents can complete their legal signature in one step.</p>
        </div>
        <label class="field-stack">
          <span>Signer</span>
          <select v-model="selectedSignerRole" class="input-select">
            <option v-for="signer in signerStatuses" :key="signer.roleId" :value="signer.roleId" :disabled="signer.status === 'signed'">
              {{ signer.label }} · {{ signer.fullName }}{{ signer.status === 'signed' ? ' (already signed)' : '' }}
            </option>
          </select>
        </label>
        <button class="button button--primary" type="button" :disabled="signatureLoading || pendingSignerCount === 0" @click="signContract">
          {{ signatureLoading ? 'Signing...' : pendingSignerCount === 0 ? 'All signatures complete' : 'Sign contract' }}
        </button>
        <p v-if="signatureFeedback" class="form-message" :class="{ 'form-message--error': signatureFeedbackTone === 'error' }">{{ signatureFeedback }}</p>
        <div class="stack stack--compact" style="margin-top: 18px;">
          <article v-for="entry in signatureLog" :key="entry.id" class="list-card">
            <h3>{{ entry.signedBy }} · {{ entry.roleId }}</h3>
            <p>{{ formatTimestamp(entry.signedAt) }} · IP {{ entry.ipAddress }}</p>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block" v-if="reEnrollment">
      <div class="section-copy">
        <p class="eyebrow">5.3 Re-enrollment</p>
        <h2>Renew next year from the app</h2>
        <p>Submit your re-enrollment request, reserve a seat, apply early bird discounts, and upload updated documents.</p>
      </div>
      <div class="summary-strip summary-strip--muted">
        <span :class="reEnrollmentStatusClass(reEnrollment.status)">{{ reEnrollmentStatusLabel(reEnrollment.status) }}</span>
        <span>Submitted {{ formatTimestamp(reEnrollment.submittedAt) }}</span>
        <span>{{ reEnrollment.seatReserved ? `Seat reserved · ${reEnrollment.seatReservationCode ?? 'code pending'}` : 'Seat not reserved' }}</span>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Submit renewal</p>
            <h3>{{ reEnrollment.yearLabel }}</h3>
            <p>Workflow: Submitted -> Under review -> Confirmed</p>
          </div>
          <label class="checkbox-row">
            <input v-model="requestSeatReservation" type="checkbox" />
            <span>Request seat reservation confirmation</span>
          </label>
          <label class="checkbox-row">
            <input v-model="applyEarlyBird" type="checkbox" :disabled="!reEnrollment.earlyBirdEligible" />
            <span>Apply early bird discount ({{ reEnrollment.earlyBirdEligible ? formatMad(reEnrollment.earlyBirdDiscountMad) : 'not eligible' }})</span>
          </label>
          <label class="field-stack">
            <span>Upload updated documents</span>
            <input class="input-file" type="file" multiple @change="onFileChange" />
          </label>
          <p v-if="selectedFiles.length" class="module-note">Selected files: {{ selectedFiles.join(', ') }}</p>
          <button class="button button--primary" type="button" :disabled="reenrollmentLoading" @click="submitReEnrollment">
            {{ reenrollmentLoading ? 'Submitting...' : 'Submit re-enrollment' }}
          </button>
          <p v-if="reenrollmentFeedback" class="form-message" :class="{ 'form-message--error': reenrollmentFeedbackTone === 'error' }">{{ reenrollmentFeedback }}</p>
        </article>
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Documents and status</p>
            <h3>Updated papers</h3>
          </div>
          <div class="stack">
            <article v-for="doc in reEnrollment.documents" :key="doc.id" class="list-card">
              <div class="list-card__header">
                <h3>{{ doc.label }}</h3>
                <span :class="doc.status === 'uploaded' ? 'status-pill' : doc.status === 'pending_review' ? 'status-pill status-pill--warning' : 'status-pill status-pill--alert'">{{ doc.status }}</span>
              </div>
              <p>{{ doc.fileName ?? 'No file uploaded yet' }}</p>
              <small v-if="doc.uploadedAt">Uploaded {{ formatTimestamp(doc.uploadedAt) }}</small>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">5.4 Contract history</p>
        <h2>Archives, amendments, and yearly comparison</h2>
        <p>All historical contracts and avenants are archived with PDF access and side-by-side yearly comparisons.</p>
      </div>
      <div class="subject-grid">
        <article v-for="item in props.viewModel.history.items" :key="item.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ item.yearLabel }}</p>
              <h3>{{ item.title }}</h3>
            </div>
            <span :class="item.kind === 'amendment' ? 'status-pill status-pill--warning' : 'status-pill status-pill--neutral'">{{ item.kind === 'amendment' ? 'Avenant' : 'Contract' }}</span>
          </div>
          <p>{{ item.summary }}</p>
          <small>Signed {{ formatTimestamp(item.signedAt) }}</small>
          <div class="pill-row" style="margin-top: 12px;">
            <a class="asset-pill" :href="item.pdfUrl">Download PDF</a>
          </div>
        </article>
      </div>
      <div class="stack" style="margin-top: 18px;">
        <article v-for="row in props.viewModel.history.yearlyComparison" :key="row.id" class="list-card">
          <div class="list-card__header">
            <h3>{{ row.label }}</h3>
            <span class="status-pill status-pill--neutral">{{ row.deltaLabel }}</span>
          </div>
          <p>Current: {{ row.currentYearValue }}</p>
          <small>Previous: {{ row.previousYearValue }}</small>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">5.5 Contract alerts</p>
        <h2>Renewal and signature reminders</h2>
        <p>Automatic reminders are prepared for expiry windows and pending signatures.</p>
      </div>
      <div class="stack">
        <article v-for="item in props.viewModel.alerts.items" :key="item.id" :class="alertClass(item)">
          <div class="alert-item__icon">{{ item.type === 'ready_to_sign' ? 'i' : item.type === 'unsigned_7_days' ? '!' : '•' }}</div>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.detail }}</p>
            <small>{{ formatTimestamp(item.scheduledFor) }} · {{ item.status }}</small>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

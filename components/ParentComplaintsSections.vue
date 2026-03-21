<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  ComplaintCategory,
  ComplaintModuleAttachmentRecord,
  ComplaintModuleRecord,
  ParentComplaintsView,
  SatisfactionSurveyAggregateView
} from '~/shared/app/types'

const props = defineProps<{ viewModel: ParentComplaintsView }>()
const emit = defineEmits<{ selectChild: [childId: string] }>()

const categoryOptions: Array<{ value: ComplaintCategory; label: string }> = [
  { value: 'academic', label: 'Academic (teaching quality, curriculum)' },
  { value: 'behavior', label: 'Behavior (bullying, discipline)' },
  { value: 'facilities', label: 'Facilities (cleanliness, maintenance)' },
  { value: 'transport', label: 'Transport' },
  { value: 'cantine_food', label: 'Cantine / Food' },
  { value: 'safety_security', label: 'Safety & Security' },
  { value: 'staff_behavior', label: 'Staff behavior' },
  { value: 'other', label: 'Other' }
]

const priorityOptions: Array<{ value: 'low' | 'medium' | 'high' | 'urgent'; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

const liveRecord = ref<{
  complaints: ComplaintModuleRecord[]
  survey: {
    monthLabel: string
    submissionWindow: string
    note: string
    submissions: unknown[]
  }
  surveyAggregate: SatisfactionSurveyAggregateView
} | null>(null)

const feedLoading = ref(false)
const feedError = ref('')

const formTitle = ref('')
const formCategory = ref<ComplaintCategory>('academic')
const formDescription = ref('')
const formPriority = ref<'low' | 'medium' | 'high' | 'urgent'>('medium')
const formAnonymous = ref(false)
const formAttachmentKind = ref<ComplaintModuleAttachmentRecord['kind']>('file')
const formAttachmentLabel = ref('')
const formAttachments = ref<Array<{ kind: ComplaintModuleAttachmentRecord['kind']; label: string }>>([])
const submitLoading = ref(false)
const submitFeedback = ref('')
const submitFeedbackTone = ref<'success' | 'error'>('success')

const selectedComplaintId = ref('')
const ratingScore = ref<1 | 2 | 3 | 4 | 5>(5)
const ratingNote = ref('')
const reopenReason = ref('')
const actionLoading = ref(false)
const actionFeedback = ref('')
const actionFeedbackTone = ref<'success' | 'error'>('success')

const surveyAnonymous = ref(false)
const surveyNps = ref(8)
const surveySuggestion = ref('')
const surveyCategoryRatings = ref(categoryOptions.map((item) => ({ category: item.value, label: item.label, score: 4 as 1 | 2 | 3 | 4 | 5 })))
const surveyLoading = ref(false)
const surveyFeedback = ref('')
const surveyFeedbackTone = ref<'success' | 'error'>('success')

watch(() => props.viewModel.activeChildId, async (childId) => {
  feedError.value = ''
  submitFeedback.value = ''
  actionFeedback.value = ''
  surveyFeedback.value = ''
  await refreshRecords(childId)
}, { immediate: true })

const record = computed(() => liveRecord.value ?? {
  complaints: props.viewModel.complaints.items,
  survey: {
    monthLabel: props.viewModel.survey.monthLabel,
    submissionWindow: props.viewModel.survey.submissionWindow,
    note: props.viewModel.survey.note,
    submissions: []
  },
  surveyAggregate: props.viewModel.survey.aggregate
})

const complaints = computed(() => record.value.complaints)

watch(complaints, (items) => {
  if (!items.find((item) => item.id === selectedComplaintId.value)) {
    selectedComplaintId.value = items[0]?.id ?? ''
  }
}, { immediate: true, deep: true })

const selectedComplaint = computed(() => complaints.value.find((item) => item.id === selectedComplaintId.value) ?? null)

function statusClass(status: ComplaintModuleRecord['status']) {
  if (status === 'resolved') return 'status-pill'
  if (status === 'reopened') return 'status-pill status-pill--alert'
  if (status === 'in_progress') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function priorityClass(priority: ComplaintModuleRecord['priority']) {
  if (priority === 'urgent') return 'status-pill status-pill--alert'
  if (priority === 'high') return 'status-pill status-pill--warning'
  if (priority === 'medium') return 'status-pill status-pill--neutral'
  return 'status-pill'
}

function formatTimestamp(value: string | null) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function addAttachment() {
  const label = formAttachmentLabel.value.trim()
  if (!label) return
  formAttachments.value.push({
    kind: formAttachmentKind.value,
    label
  })
  formAttachmentLabel.value = ''
}

function removeAttachment(index: number) {
  formAttachments.value.splice(index, 1)
}

async function refreshRecords(childId: string | null) {
  liveRecord.value = null
  if (!childId) return

  feedLoading.value = true
  try {
    liveRecord.value = await $fetch('/api/parent/complaints/records', { query: { child: childId } })
  } catch {
    feedError.value = 'Live complaint data could not be refreshed. Showing seeded records.'
    liveRecord.value = null
  } finally {
    feedLoading.value = false
  }
}

async function submitComplaintForm() {
  const childId = props.viewModel.activeChildId
  if (!childId || !formDescription.value.trim()) {
    submitFeedbackTone.value = 'error'
    submitFeedback.value = 'Please add at least a complaint description before submitting.'
    return
  }

  submitLoading.value = true
  try {
    const payload = await $fetch('/api/parent/complaints/submit', {
      method: 'POST',
      body: {
        childId,
        title: formTitle.value,
        category: formCategory.value,
        description: formDescription.value,
        priority: formPriority.value,
        anonymous: formAnonymous.value,
        attachments: formAttachments.value
      }
    })
    liveRecord.value = payload as typeof liveRecord.value
    submitFeedbackTone.value = 'success'
    submitFeedback.value = 'Complaint submitted.'
    formTitle.value = ''
    formDescription.value = ''
    formPriority.value = 'medium'
    formCategory.value = 'academic'
    formAnonymous.value = false
    formAttachmentLabel.value = ''
    formAttachments.value = []
  } catch {
    submitFeedbackTone.value = 'error'
    submitFeedback.value = 'Complaint could not be submitted right now.'
  } finally {
    submitLoading.value = false
  }
}

async function rateComplaint() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedComplaint.value) return
  actionLoading.value = true
  try {
    const payload = await $fetch('/api/parent/complaints/actions', {
      method: 'POST',
      body: {
        action: 'rate',
        childId,
        complaintId: selectedComplaint.value.id,
        score: ratingScore.value,
        note: ratingNote.value
      }
    })
    liveRecord.value = payload as typeof liveRecord.value
    actionFeedbackTone.value = 'success'
    actionFeedback.value = 'Resolution rating saved.'
  } catch {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Resolution rating could not be saved.'
  } finally {
    actionLoading.value = false
  }
}

async function reopenComplaintRecord() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedComplaint.value) return
  if (!reopenReason.value.trim()) {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Add a reason before reopening this complaint.'
    return
  }
  actionLoading.value = true
  try {
    const payload = await $fetch('/api/parent/complaints/actions', {
      method: 'POST',
      body: {
        action: 'reopen',
        childId,
        complaintId: selectedComplaint.value.id,
        reason: reopenReason.value
      }
    })
    liveRecord.value = payload as typeof liveRecord.value
    reopenReason.value = ''
    actionFeedbackTone.value = 'success'
    actionFeedback.value = 'Complaint reopened.'
  } catch {
    actionFeedbackTone.value = 'error'
    actionFeedback.value = 'Complaint could not be reopened.'
  } finally {
    actionLoading.value = false
  }
}

async function submitSurvey() {
  const childId = props.viewModel.activeChildId
  if (!childId) return
  surveyLoading.value = true
  try {
    const payload = await $fetch('/api/parent/complaints/surveys', {
      method: 'POST',
      body: {
        childId,
        anonymous: surveyAnonymous.value,
        npsScore: surveyNps.value,
        categoryRatings: surveyCategoryRatings.value,
        suggestion: surveySuggestion.value
      }
    })
    liveRecord.value = payload as typeof liveRecord.value
    surveyFeedbackTone.value = 'success'
    surveyFeedback.value = 'Monthly survey submitted.'
    surveySuggestion.value = ''
  } catch {
    surveyFeedbackTone.value = 'error'
    surveyFeedback.value = 'Survey submission failed. Please try again.'
  } finally {
    surveyLoading.value = false
  }
}
</script>

<template>
  <div>
    <motion.section class="dashboard-hero-card" :initial="{ opacity: 0, y: 18 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.35 }">
      <template v-if="props.viewModel.activeChild">
        <div class="dashboard-hero-card__media"><div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div></div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">Complaints & feedback</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} - {{ props.viewModel.activeChild.gradeLabel }} - {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ props.viewModel.complaints.openCount }} open</span>
            <span>{{ props.viewModel.complaints.resolvedCount }} resolved</span>
            <span>{{ props.viewModel.survey.aggregate.totalResponses }} survey responses</span>
          </div>
          <p class="dashboard-hero-card__highlight">Submit complaints with attachments, track school updates, rate resolutions, and share monthly feedback.</p>
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
        <div class="hero-summary hero-summary--single"><article class="hero-summary__card"><p class="eyebrow">Complaints & feedback</p><h3>No complaint profile linked yet</h3><p>Once a child is linked, you can submit complaints, track resolution steps, and submit monthly feedback here.</p></article></div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy"><p class="eyebrow">At a glance</p><h2>Complaint and satisfaction pulse</h2><p>Status tracking, escalation visibility, and monthly NPS stay in one parent workspace.</p></div>
      <div class="stat-grid stat-grid--four"><article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase"><p class="eyebrow">{{ stat.label }}</p><h3>{{ stat.value }}</h3><p>{{ stat.detail }}</p></article></div>
      <p v-if="feedError" class="form-message form-message--error">{{ feedError }}</p>
      <p v-else-if="feedLoading" class="module-note">Refreshing complaints and survey data...</p>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">10.1 Submit a complaint</p><h2>Category, issue details, priority, and anonymity</h2><p>Share issue context with optional attachments and decide whether to submit anonymously.</p></div>
        <label class="field-stack"><span>Issue title (optional)</span><input v-model="formTitle" type="text" class="input-textarea input-textarea--single" placeholder="Short complaint title" /></label>
        <label class="field-stack"><span>Category</span><select v-model="formCategory" class="input-select"><option v-for="item in categoryOptions" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <label class="field-stack"><span>Description</span><textarea v-model="formDescription" class="input-textarea" rows="5" placeholder="Describe the issue in detail"></textarea></label>
        <label class="field-stack"><span>Priority</span><select v-model="formPriority" class="input-select"><option v-for="item in priorityOptions" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <label class="checkbox-row"><input v-model="formAnonymous" type="checkbox" /><span>Submit anonymously</span></label>

        <div class="panel-card panel-card--inner" style="margin-top: 16px;">
          <div class="section-copy section-copy--tight"><p class="eyebrow">Attachments</p><h3>Add supporting files</h3></div>
          <label class="field-stack"><span>Attachment type</span><select v-model="formAttachmentKind" class="input-select"><option value="file">File</option><option value="pdf">PDF</option><option value="image">Image</option><option value="link">Link</option></select></label>
          <label class="field-stack"><span>Attachment label</span><input v-model="formAttachmentLabel" type="text" class="input-textarea input-textarea--single" placeholder="Example: hallway photo, note, checklist" /></label>
          <div class="pill-row"><button class="button button--secondary" type="button" @click="addAttachment">Add attachment</button></div>
          <div v-if="formAttachments.length" class="stack stack--compact" style="margin-top: 12px;">
            <article v-for="(item, index) in formAttachments" :key="`${item.kind}-${item.label}-${index}`" class="list-card">
              <div class="list-card__header"><div><h3>{{ item.label }}</h3><p>{{ item.kind }}</p></div><button class="button button--secondary" type="button" @click="removeAttachment(index)">Remove</button></div>
            </article>
          </div>
        </div>

        <button class="button button--primary" type="button" :disabled="submitLoading" @click="submitComplaintForm">{{ submitLoading ? 'Submitting...' : 'Submit complaint' }}</button>
        <p v-if="submitFeedback" class="form-message" :class="{ 'form-message--error': submitFeedbackTone === 'error' }">{{ submitFeedback }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">10.2 Complaint tracking</p><h2>Status, school response, SLA, escalation, and history</h2><p>Track each complaint from submission to resolution and reopen when the outcome is not satisfactory.</p></div>
        <label class="field-stack"><span>Select complaint</span><select v-model="selectedComplaintId" class="input-select"><option v-for="item in complaints" :key="item.id" :value="item.id">{{ item.title }} - {{ item.status }} - {{ item.priority }}</option></select></label>
        <template v-if="selectedComplaint">
          <div class="list-card" style="margin-top: 16px;">
            <div class="list-card__header"><div><h3>{{ selectedComplaint.title }}</h3><p>{{ selectedComplaint.category.replace(/_/g, ' ') }}</p></div><span :class="statusClass(selectedComplaint.status)">{{ selectedComplaint.status }}</span></div>
            <p>{{ selectedComplaint.description }}</p>
            <div class="summary-strip summary-strip--muted"><span :class="priorityClass(selectedComplaint.priority)">Priority {{ selectedComplaint.priority }}</span><span>Submitted {{ formatTimestamp(selectedComplaint.createdAt) }}</span><span>ETA {{ formatTimestamp(selectedComplaint.estimatedResolutionAt) }}</span></div>
            <p v-if="selectedComplaint.schoolResponse" class="module-note">{{ selectedComplaint.schoolResponse }}</p>
            <p class="module-note">{{ selectedComplaint.escalation.detail }}{{ selectedComplaint.escalation.escalated ? ` Escalated at ${formatTimestamp(selectedComplaint.escalation.escalatedAt)}.` : '' }}</p>
            <div v-if="selectedComplaint.attachments.length" class="pill-row" style="margin-top: 12px;"><a v-for="item in selectedComplaint.attachments" :key="item.id" class="asset-pill" :href="item.url">{{ item.kind }} - {{ item.label }}</a></div>
          </div>

          <div class="stack stack--compact" style="margin-top: 16px;">
            <article v-for="item in selectedComplaint.history.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())" :key="item.id" class="list-card">
              <div class="list-card__header"><div><h3>{{ item.status }}</h3><p>{{ formatTimestamp(item.createdAt) }}</p></div><span class="status-pill status-pill--neutral">{{ item.actor }}</span></div>
              <p>{{ item.note }}</p>
            </article>
          </div>

          <div v-if="selectedComplaint.status === 'resolved'" class="panel-card panel-card--inner" style="margin-top: 16px;">
            <div class="section-copy section-copy--tight"><p class="eyebrow">Resolution feedback</p><h3>Rate and reopen if needed</h3></div>
            <template v-if="selectedComplaint.resolutionRating">
              <p class="module-note">Rated {{ selectedComplaint.resolutionRating.score }}/5 on {{ formatTimestamp(selectedComplaint.resolutionRating.ratedAt) }}</p>
              <p v-if="selectedComplaint.resolutionRating.note" class="module-note">{{ selectedComplaint.resolutionRating.note }}</p>
            </template>
            <template v-else>
              <label class="field-stack"><span>Rating (1-5)</span><select v-model="ratingScore" class="input-select"><option :value="1">1</option><option :value="2">2</option><option :value="3">3</option><option :value="4">4</option><option :value="5">5</option></select></label>
              <label class="field-stack"><span>Comment (optional)</span><textarea v-model="ratingNote" class="input-textarea" rows="3" placeholder="Share your resolution feedback"></textarea></label>
              <button class="button button--secondary" type="button" :disabled="actionLoading" @click="rateComplaint">{{ actionLoading ? 'Saving...' : 'Save rating' }}</button>
            </template>
            <label class="field-stack" style="margin-top: 12px;"><span>Reason to reopen</span><textarea v-model="reopenReason" class="input-textarea" rows="3" placeholder="Explain why this case should be reopened"></textarea></label>
            <button class="button button--secondary" type="button" :disabled="actionLoading" @click="reopenComplaintRecord">{{ actionLoading ? 'Reopening...' : 'Reopen complaint' }}</button>
          </div>

          <p v-if="actionFeedback" class="form-message" :class="{ 'form-message--error': actionFeedbackTone === 'error' }">{{ actionFeedback }}</p>
        </template>
      </section>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">10.3 Satisfaction surveys</p><h2>Monthly NPS and category ratings</h2><p>{{ record.survey.monthLabel }} - {{ record.survey.submissionWindow }}</p></div>
        <label class="field-stack"><span>NPS score (0-10)</span><input v-model.number="surveyNps" type="number" min="0" max="10" class="input-textarea input-textarea--single" /></label>
        <div class="stack stack--compact">
          <label v-for="item in surveyCategoryRatings" :key="item.category" class="field-stack"><span>{{ item.label }}</span><select v-model="item.score" class="input-select"><option :value="1">1 - Poor</option><option :value="2">2</option><option :value="3">3</option><option :value="4">4</option><option :value="5">5 - Excellent</option></select></label>
        </div>
        <label class="field-stack"><span>Open suggestion</span><textarea v-model="surveySuggestion" class="input-textarea" rows="4" placeholder="Share any additional feedback"></textarea></label>
        <label class="checkbox-row"><input v-model="surveyAnonymous" type="checkbox" /><span>Submit survey anonymously</span></label>
        <button class="button button--primary" type="button" :disabled="surveyLoading" @click="submitSurvey">{{ surveyLoading ? 'Submitting...' : 'Submit monthly survey' }}</button>
        <p v-if="surveyFeedback" class="form-message" :class="{ 'form-message--error': surveyFeedbackTone === 'error' }">{{ surveyFeedback }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy"><p class="eyebrow">Aggregate school insight</p><h2>Visible to school as trends only</h2><p>{{ record.survey.note }}</p></div>
        <div class="summary-strip"><span>{{ record.surveyAggregate.totalResponses }} responses</span><span>{{ record.surveyAggregate.anonymousResponses }} anonymous</span><span>NPS {{ record.surveyAggregate.npsScore }}</span></div>
        <div class="summary-strip summary-strip--muted" style="margin-top: 10px;"><span>Promoters {{ record.surveyAggregate.promoters }}</span><span>Passives {{ record.surveyAggregate.passives }}</span><span>Detractors {{ record.surveyAggregate.detractors }}</span></div>
        <p class="module-note">Average NPS score: {{ record.surveyAggregate.averageNps }}</p>
        <div class="stack stack--compact" style="margin-top: 12px;">
          <article v-for="item in record.surveyAggregate.categoryAverages" :key="item.category" class="list-card">
            <div class="list-card__header"><h3>{{ item.label }}</h3><span class="status-pill status-pill--neutral">{{ item.averageScore.toFixed(1) }}/5</span></div>
          </article>
        </div>
        <div v-if="record.surveyAggregate.latestSuggestions.length" class="stack stack--compact" style="margin-top: 16px;">
          <article v-for="(item, index) in record.surveyAggregate.latestSuggestions" :key="`${index}-${item}`" class="list-card">
            <h3>Suggestion {{ index + 1 }}</h3>
            <p>{{ item }}</p>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

import { childComplaintsById } from '~/shared/app/complaints'
import { seedParentAccounts } from '~/shared/app/data'
import type {
  ChildComplaintsModuleRecord,
  ComplaintCategory,
  ComplaintModuleAttachmentRecord,
  ComplaintModuleRecord,
  ComplaintPriority,
  SatisfactionSurveyAggregateView,
  SatisfactionSurveySubmissionRecord
} from '~/shared/app/types'

interface ParentComplaintsStore {
  sequence: number
  byChild: Record<string, ChildComplaintsModuleRecord>
}

interface SubmitComplaintInput {
  childId: string
  title: string
  category: ComplaintCategory
  description: string
  priority: ComplaintPriority
  anonymous: boolean
  attachments: Array<{
    kind: ComplaintModuleAttachmentRecord['kind']
    label: string
  }>
  actorName: string
}

interface RateComplaintInput {
  childId: string
  complaintId: string
  score: 1 | 2 | 3 | 4 | 5
  note: string
}

interface ReopenComplaintInput {
  childId: string
  complaintId: string
  reason: string
  actorName: string
}

interface SubmitSurveyInput {
  childId: string
  anonymous: boolean
  npsScore: number
  categoryRatings: Array<{
    category: ComplaintCategory
    label: string
    score: 1 | 2 | 3 | 4 | 5
  }>
  suggestion: string
}

function cloneAttachment(item: ComplaintModuleAttachmentRecord): ComplaintModuleAttachmentRecord {
  return { ...item }
}

function cloneComplaint(item: ComplaintModuleRecord): ComplaintModuleRecord {
  return {
    ...item,
    escalation: { ...item.escalation },
    attachments: item.attachments.map((entry) => cloneAttachment(entry)),
    history: item.history.map((entry) => ({ ...entry })),
    resolutionRating: item.resolutionRating ? { ...item.resolutionRating } : null
  }
}

function cloneSurveySubmission(item: SatisfactionSurveySubmissionRecord): SatisfactionSurveySubmissionRecord {
  return {
    ...item,
    categoryRatings: item.categoryRatings.map((entry) => ({ ...entry }))
  }
}

function cloneRecord(record: ChildComplaintsModuleRecord): ChildComplaintsModuleRecord {
  return {
    complaints: record.complaints.map((entry) => cloneComplaint(entry)),
    survey: {
      monthLabel: record.survey.monthLabel,
      submissionWindow: record.survey.submissionWindow,
      note: record.survey.note,
      submissions: record.survey.submissions.map((entry) => cloneSurveySubmission(entry))
    }
  }
}

function createStore(): ParentComplaintsStore {
  const byChild: ParentComplaintsStore['byChild'] = {}
  for (const [childId, record] of Object.entries(childComplaintsById)) {
    byChild[childId] = cloneRecord(record)
  }
  return { sequence: 0, byChild }
}

function getStore() {
  const key = '__school_os_parent_complaints_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentComplaintsStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentComplaintsStore
}

function nowIso() {
  return new Date().toISOString()
}

function pad(value: number, size: number) {
  return String(value).padStart(size, '0')
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

function estimateResolutionAt(priority: ComplaintPriority) {
  const hours = priority === 'urgent'
    ? 24
    : priority === 'high'
      ? 48
      : priority === 'medium'
        ? 96
        : 120
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

function buildAttachmentUrl(label: string) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(`${label}\nUploaded from parent complaints form`)}` 
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
      ? Math.round((ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length) * 10) / 10
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

function applyEscalationRules(item: ComplaintModuleRecord) {
  if (item.status === 'resolved') return
  if (item.escalation.escalated) return
  const ageMs = Date.now() - new Date(item.createdAt).getTime()
  const ageDays = ageMs / (24 * 60 * 60 * 1000)
  if (ageDays >= item.escalation.thresholdDays) {
    item.escalation.escalated = true
    item.escalation.escalatedAt = nowIso()
    item.history.push({
      id: `complaint-h-${pad(Date.now() % 100000, 5)}`,
      status: item.status === 'submitted' ? 'in_progress' : item.status,
      note: 'Case escalated automatically after SLA threshold was exceeded.',
      actor: 'system',
      createdAt: nowIso()
    })
  }
}

export function findComplaintChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function getComplaintActorName(childId: string) {
  const parent = seedParentAccounts.find((account) => account.children.some((child) => child.id === childId))
  return parent?.profile.displayName ?? 'Parent'
}

export function getComplaintsRecord(childId: string) {
  const record = getStore().byChild[childId]
  if (!record) return null

  for (const item of record.complaints) {
    applyEscalationRules(item)
  }

  const complaints = sortComplaints(record.complaints).map((item) => cloneComplaint(item))
  const survey = {
    monthLabel: record.survey.monthLabel,
    submissionWindow: record.survey.submissionWindow,
    note: record.survey.note,
    submissions: record.survey.submissions.map((item) => cloneSurveySubmission(item))
  }

  return {
    complaints,
    survey,
    surveyAggregate: buildSurveyAggregate(survey.submissions)
  }
}

export function submitComplaint(input: SubmitComplaintInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Complaints record not found')

  const description = input.description.trim()
  if (!description) throw new Error('Complaint description is required')

  const title = input.title.trim() || description.slice(0, 80)
  if (!title) throw new Error('Complaint title is required')

  store.sequence += 1
  const id = `cmp-live-${pad(store.sequence, 4)}`
  const createdAt = nowIso()
  record.complaints.unshift({
    id,
    childId: input.childId,
    title,
    category: input.category,
    description,
    priority: input.priority,
    anonymous: input.anonymous,
    createdAt,
    updatedAt: createdAt,
    status: 'submitted',
    schoolResponse: null,
    estimatedResolutionAt: estimateResolutionAt(input.priority),
    escalation: {
      thresholdDays: input.priority === 'urgent' ? 2 : input.priority === 'high' ? 3 : input.priority === 'medium' ? 5 : 7,
      escalated: false,
      escalatedAt: null,
      detail: 'Escalates automatically if not resolved within the SLA threshold.'
    },
    attachments: input.attachments.map((item, index) => ({
      id: `cmp-att-${pad(store.sequence, 4)}-${index + 1}`,
      kind: item.kind,
      label: item.label.trim() || `${item.kind} attachment`,
      url: buildAttachmentUrl(item.label.trim() || `${item.kind} attachment`)
    })),
    history: [
      {
        id: `cmp-h-${pad(store.sequence, 4)}-1`,
        status: 'submitted',
        note: input.anonymous ? 'Complaint submitted anonymously by parent.' : `Complaint submitted by ${input.actorName}.`,
        actor: 'parent',
        createdAt
      }
    ],
    resolutionRating: null
  })

  return {
    ...getComplaintsRecord(input.childId),
    message: 'Complaint submitted successfully.'
  }
}

export function rateComplaintResolution(input: RateComplaintInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Complaints record not found')

  const complaint = record.complaints.find((item) => item.id === input.complaintId)
  if (!complaint) throw new Error('Complaint not found')
  if (complaint.status !== 'resolved') throw new Error('Only resolved complaints can be rated')
  if (input.score < 1 || input.score > 5) throw new Error('Rating score must be between 1 and 5')

  const ratedAt = nowIso()
  complaint.resolutionRating = {
    score: input.score,
    note: input.note.trim() || null,
    ratedAt
  }
  complaint.updatedAt = ratedAt
  complaint.history.push({
    id: `cmp-h-${pad(Date.now() % 100000, 5)}`,
    status: 'resolved',
    note: `Parent submitted a ${input.score}/5 resolution rating.`,
    actor: 'parent',
    createdAt: ratedAt
  })

  return {
    ...getComplaintsRecord(input.childId),
    message: 'Resolution rating saved.'
  }
}

export function reopenComplaint(input: ReopenComplaintInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Complaints record not found')

  const complaint = record.complaints.find((item) => item.id === input.complaintId)
  if (!complaint) throw new Error('Complaint not found')
  if (complaint.status !== 'resolved') throw new Error('Only resolved complaints can be reopened')

  const reason = input.reason.trim()
  if (!reason) throw new Error('Reopen reason is required')

  const reopenedAt = nowIso()
  complaint.status = 'reopened'
  complaint.updatedAt = reopenedAt
  complaint.schoolResponse = 'Complaint reopened by parent. School team reassigned and follow-up is in progress.'
  complaint.estimatedResolutionAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  complaint.escalation.escalated = false
  complaint.escalation.escalatedAt = null
  complaint.resolutionRating = null
  complaint.history.push({
    id: `cmp-h-${pad(Date.now() % 100000, 5)}`,
    status: 'reopened',
    note: `${input.actorName} reopened this complaint. Reason: ${reason}`,
    actor: 'parent',
    createdAt: reopenedAt
  })

  return {
    ...getComplaintsRecord(input.childId),
    message: 'Complaint reopened and sent back to school follow-up.'
  }
}

export function submitSatisfactionSurvey(input: SubmitSurveyInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) throw new Error('Complaints record not found')
  if (!Number.isFinite(input.npsScore) || input.npsScore < 0 || input.npsScore > 10) {
    throw new Error('NPS score must be between 0 and 10')
  }
  if (!input.categoryRatings.length) {
    throw new Error('At least one category rating is required')
  }

  for (const rating of input.categoryRatings) {
    if (rating.score < 1 || rating.score > 5) {
      throw new Error('Category scores must be between 1 and 5')
    }
  }

  store.sequence += 1
  record.survey.submissions.push({
    id: `survey-live-${pad(store.sequence, 4)}`,
    submittedAt: nowIso(),
    monthLabel: record.survey.monthLabel,
    anonymous: input.anonymous,
    npsScore: Math.round(input.npsScore),
    categoryRatings: input.categoryRatings.map((item) => ({ ...item })),
    suggestion: input.suggestion.trim() || null
  })

  return {
    ...getComplaintsRecord(input.childId),
    message: 'Monthly satisfaction survey submitted.'
  }
}

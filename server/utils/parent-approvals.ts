import { childApprovalsById } from '~/shared/app/approvals'
import { seedParentAccounts } from '~/shared/app/data'
import type {
  ApprovalRequestRecord,
  ApprovalSignatureLogRecord,
  ChildApprovalsRecord
} from '~/shared/app/types'

interface ParentApprovalsStore {
  sequence: number
  byChild: Record<string, ChildApprovalsRecord>
}

interface SignApprovalInput {
  childId: string
  approvalId: string
  actorName: string
  ipAddress: string
  deviceInfo: string
}

interface RevokeApprovalInput extends SignApprovalInput {
  reason: string
}

function cloneApproval(item: ApprovalRequestRecord): ApprovalRequestRecord {
  return {
    ...item,
    attachments: item.attachments.map((entry) => ({ ...entry })),
    reminders: item.reminders.map((entry) => ({ ...entry }))
  }
}

function cloneLog(item: ApprovalSignatureLogRecord): ApprovalSignatureLogRecord {
  return { ...item }
}

function cloneRecord(record: ChildApprovalsRecord): ChildApprovalsRecord {
  return {
    items: record.items.map((entry) => cloneApproval(entry)),
    signatureLog: record.signatureLog.map((entry) => cloneLog(entry)),
    flowNote: record.flowNote,
    archiveNote: record.archiveNote
  }
}

function createStore(): ParentApprovalsStore {
  const byChild: ParentApprovalsStore['byChild'] = {}
  for (const [childId, record] of Object.entries(childApprovalsById)) {
    byChild[childId] = cloneRecord(record)
  }

  return {
    sequence: 0,
    byChild
  }
}

function getStore() {
  const key = '__school_os_parent_approvals_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentApprovalsStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentApprovalsStore
}

function pad(value: number, size: number) {
  return String(value).padStart(size, '0')
}

function nowIso() {
  return new Date().toISOString()
}

function sortItems(items: ApprovalRequestRecord[]) {
  const order: Record<ApprovalRequestRecord['status'], number> = {
    pending: 0,
    signed: 1,
    revoked: 2,
    expired: 3
  }

  return [...items].sort((left, right) => {
    const statusDelta = order[left.status] - order[right.status]
    if (statusDelta !== 0) return statusDelta
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

function sortLog(items: ApprovalSignatureLogRecord[]) {
  return [...items].sort((left, right) => new Date(right.actedAt).getTime() - new Date(left.actedAt).getTime())
}

function ensureRecord(childId: string) {
  return getStore().byChild[childId] ?? null
}

function findApproval(record: ChildApprovalsRecord, approvalId: string) {
  return record.items.find((item) => item.id === approvalId) ?? null
}

export function findApprovalChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function getApprovalActorName(childId: string) {
  const parent = seedParentAccounts.find((account) => account.children.some((child) => child.id === childId))
  return parent?.profile.displayName ?? 'Parent'
}

export function getApprovalRecord(childId: string) {
  const record = ensureRecord(childId)
  if (!record) return null

  return {
    items: sortItems(record.items).map((item) => cloneApproval(item)),
    signatureLog: sortLog(record.signatureLog).map((item) => cloneLog(item)),
    flowNote: record.flowNote,
    archiveNote: record.archiveNote
  }
}

export function signApproval(input: SignApprovalInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) {
    throw new Error('Approvals record not found')
  }

  const approval = findApproval(record, input.approvalId)
  if (!approval) {
    throw new Error('Approval not found')
  }
  if (approval.status === 'signed') {
    return {
      ...getApprovalRecord(input.childId),
      message: 'Approval was already signed.'
    }
  }
  if (approval.status === 'revoked' || approval.status === 'expired') {
    throw new Error('This approval can no longer be signed.')
  }

  store.sequence += 1
  const actedAt = nowIso()
  approval.status = 'signed'
  approval.signedAt = actedAt
  approval.signerName = input.actorName
  approval.updatedAt = actedAt
  approval.schoolConfirmation = `Signed in app on ${new Date(actedAt).toLocaleString('en-GB')}. School received instant confirmation.`
  approval.reminders = approval.reminders.map((item) => ({ ...item, status: 'sent' }))

  record.signatureLog = [
    {
      id: `approval-log-${pad(store.sequence, 4)}`,
      approvalId: approval.id,
      action: 'signed' as const,
      actorName: input.actorName,
      actedAt,
      ipAddress: input.ipAddress,
      deviceInfo: input.deviceInfo
    },
    ...record.signatureLog
  ].slice(0, 200)

  return {
    ...getApprovalRecord(input.childId),
    message: 'Approval signed successfully and archived with timestamp, IP, and device trace.'
  }
}

export function revokeApproval(input: RevokeApprovalInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) {
    throw new Error('Approvals record not found')
  }

  const approval = findApproval(record, input.approvalId)
  if (!approval) {
    throw new Error('Approval not found')
  }
  if (approval.status !== 'signed') {
    throw new Error('Only signed approvals can be revoked.')
  }
  if (!approval.canRevoke) {
    throw new Error('This approval cannot be revoked.')
  }

  const deadlineMs = approval.revokeDeadline ? new Date(approval.revokeDeadline).getTime() : Number.POSITIVE_INFINITY
  if (Number.isFinite(deadlineMs) && Date.now() > deadlineMs) {
    throw new Error('The revocation window has closed for this approval.')
  }

  const reason = input.reason.trim()
  if (!reason) {
    throw new Error('A short revocation reason is required.')
  }

  store.sequence += 1
  const actedAt = nowIso()
  approval.status = 'revoked'
  approval.updatedAt = actedAt
  approval.canRevoke = false
  approval.schoolConfirmation = `Consent revoked in app on ${new Date(actedAt).toLocaleString('en-GB')}. School was notified instantly.`
  approval.revokePolicy = `${approval.revokePolicy} Revocation note: ${reason}`

  record.signatureLog = [
    {
      id: `approval-log-${pad(store.sequence, 4)}`,
      approvalId: approval.id,
      action: 'revoked' as const,
      actorName: input.actorName,
      actedAt,
      ipAddress: input.ipAddress,
      deviceInfo: input.deviceInfo
    },
    ...record.signatureLog
  ].slice(0, 200)

  return {
    ...getApprovalRecord(input.childId),
    message: 'Consent revoked and archived with full traceability.'
  }
}

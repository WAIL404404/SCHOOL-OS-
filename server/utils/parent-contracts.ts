import { childContractsById } from '~/shared/app/contracts'
import { seedParentAccounts } from '~/shared/app/data'
import type { ContractReEnrollmentRecord, ContractSignatureLogRecord, ContractSignerStatusView } from '~/shared/app/types'

interface ParentContractsStore {
  sequence: number
  signaturesByChild: Record<string, ContractSignatureLogRecord[]>
  reEnrollmentByChild: Record<string, ContractReEnrollmentRecord>
}

interface SignContractInput {
  childId: string
  roleId: 'parent_1' | 'parent_2'
  ipAddress: string
}

interface SubmitReEnrollmentInput {
  childId: string
  requestSeatReservation: boolean
  applyEarlyBird: boolean
  uploadedFiles: string[]
}

function createStore(): ParentContractsStore {
  const signaturesByChild: ParentContractsStore['signaturesByChild'] = {}
  const reEnrollmentByChild: ParentContractsStore['reEnrollmentByChild'] = {}

  for (const [childId, record] of Object.entries(childContractsById)) {
    signaturesByChild[childId] = [...record.signatureLog]
    reEnrollmentByChild[childId] = {
      ...record.reEnrollment,
      documents: record.reEnrollment.documents.map((doc) => ({ ...doc }))
    }
  }

  return {
    sequence: 0,
    signaturesByChild,
    reEnrollmentByChild
  }
}

function getStore() {
  const key = '__school_os_parent_contracts_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentContractsStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentContractsStore
}

function ensureChildRecord(childId: string) {
  return childContractsById[childId] ?? null
}

function timestampSafe(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 0
  return parsed.getTime()
}

function sortSignatures(items: ContractSignatureLogRecord[]) {
  return [...items].sort((left, right) => timestampSafe(right.signedAt) - timestampSafe(left.signedAt))
}

function generateSeatCode(childId: string, sequence: number) {
  const childToken = childId.replace('student-', '').slice(0, 6).toUpperCase()
  return `SEAT-${childToken}-26-${String(sequence).padStart(3, '0')}`
}

export function findContractChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function listContractSignatures(childId: string) {
  const store = getStore()
  return sortSignatures(store.signaturesByChild[childId] ?? [])
}

export function listContractSignerStatuses(childId: string): ContractSignerStatusView[] {
  const base = ensureChildRecord(childId)
  if (!base) return []

  const signatures = listContractSignatures(childId)
  return base.signers.map((signer) => {
    const signed = signatures.find((item) => item.roleId === signer.roleId)
    return {
      ...signer,
      status: signed ? 'signed' : 'pending',
      signedAt: signed?.signedAt ?? null,
      ipAddress: signed?.ipAddress ?? null
    }
  })
}

export function signContract(input: SignContractInput) {
  const store = getStore()
  const base = ensureChildRecord(input.childId)
  if (!base) {
    throw new Error('Child contracts record not found')
  }

  const signer = base.signers.find((item) => item.roleId === input.roleId)
  if (!signer) {
    throw new Error('Signer role not found')
  }

  const existing = listContractSignatures(input.childId).find((item) => item.roleId === input.roleId)
  if (existing) {
    return {
      signers: listContractSignerStatuses(input.childId),
      log: listContractSignatures(input.childId),
      message: `${signer.fullName} already signed on ${new Date(existing.signedAt).toLocaleString('en-GB')}.`
    }
  }

  store.sequence += 1
  const entry: ContractSignatureLogRecord = {
    id: `sig-live-${String(store.sequence).padStart(4, '0')}`,
    contractId: base.current.id,
    roleId: input.roleId,
    signedBy: signer.fullName,
    signedAt: new Date().toISOString(),
    ipAddress: input.ipAddress || '127.0.0.1'
  }

  const signatures = store.signaturesByChild[input.childId] ?? []
  store.signaturesByChild[input.childId] = [entry, ...signatures].slice(0, 80)

  return {
    signers: listContractSignerStatuses(input.childId),
    log: listContractSignatures(input.childId),
    message: `Signature recorded for ${signer.fullName}. Timestamp and IP log were stored for legal traceability.`
  }
}

export function getContractReEnrollment(childId: string) {
  const store = getStore()
  const item = store.reEnrollmentByChild[childId]
  if (!item) return null
  return {
    ...item,
    documents: item.documents.map((doc) => ({ ...doc }))
  }
}

export function submitContractReEnrollment(input: SubmitReEnrollmentInput) {
  const store = getStore()
  const existing = store.reEnrollmentByChild[input.childId]
  if (!existing) {
    throw new Error('Re-enrollment record not found')
  }

  store.sequence += 1
  const now = new Date().toISOString()
  const next = {
    ...existing,
    updatedAt: now,
    seatReserved: input.requestSeatReservation || existing.seatReserved,
    seatReservationCode: input.requestSeatReservation
      ? (existing.seatReservationCode ?? generateSeatCode(input.childId, store.sequence))
      : existing.seatReservationCode,
    earlyBirdEligible: input.applyEarlyBird ? existing.earlyBirdEligible : existing.earlyBirdEligible,
    documents: existing.documents.map((doc) => ({ ...doc }))
  }

  if (input.uploadedFiles.length) {
    const pendingDocs = next.documents.filter((doc) => doc.status !== 'uploaded')
    input.uploadedFiles.forEach((name, index) => {
      const target = pendingDocs[index]
      if (target) {
        target.fileName = name
        target.uploadedAt = now
        target.status = 'pending_review'
      } else {
        next.documents.push({
          id: `doc-extra-${String(store.sequence + index).padStart(3, '0')}`,
          label: `Additional file ${index + 1}`,
          status: 'pending_review',
          fileName: name,
          uploadedAt: now
        })
      }
    })
  }

  if (next.status === 'submitted') {
    next.status = 'under_review'
  }

  const hasMissingDocuments = next.documents.some((doc) => doc.status === 'missing')
  if (next.status === 'under_review' && !hasMissingDocuments && next.seatReserved) {
    next.status = 'confirmed'
  }

  store.reEnrollmentByChild[input.childId] = next

  const message = next.status === 'confirmed'
    ? `Re-enrollment confirmed. Seat reservation code: ${next.seatReservationCode ?? 'pending'}.`
    : next.status === 'under_review'
      ? 'Re-enrollment submitted and moved to under-review status.'
      : 'Re-enrollment request submitted.'

  return {
    item: getContractReEnrollment(input.childId),
    message
  }
}

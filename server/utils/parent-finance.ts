import { childFinanceById } from '~/shared/app/finance'
import { seedParentAccounts } from '~/shared/app/data'
import type { FinancialPaymentHistoryRecord, FinancialRequestRecord } from '~/shared/app/types'

interface ParentFinanceStore {
  sequence: number
  paymentsByChild: Record<string, FinancialPaymentHistoryRecord[]>
  requestsByChild: Record<string, FinancialRequestRecord[]>
}

interface SubmitPaymentInput {
  childId: string
  gateway: 'CMI (Morocco)' | 'Stripe' | 'PayPal'
  mode: 'full' | 'partial' | 'installment'
  amountMad: number
  installments: 2 | 3 | 4 | null
  autoPay: boolean
}

interface SubmitRequestInput {
  childId: string
  type: 'installment_plan' | 'discount' | 'scholarship'
  requestedAmountMad: number | null
  detail: string
  agreementAccepted: boolean
}

function createStore(): ParentFinanceStore {
  const paymentsByChild: ParentFinanceStore['paymentsByChild'] = {}
  const requestsByChild: ParentFinanceStore['requestsByChild'] = {}

  for (const [childId, record] of Object.entries(childFinanceById)) {
    paymentsByChild[childId] = [...record.paymentHistory]
    requestsByChild[childId] = [...record.requests]
  }

  return {
    sequence: 0,
    paymentsByChild,
    requestsByChild
  }
}

function getStore() {
  const key = '__school_os_parent_finance_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentFinanceStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentFinanceStore
}

function documentUrl(childId: string, type: 'invoice' | 'receipt' | 'agreement', ref: string) {
  const query = new URLSearchParams({ child: childId, type, ref })
  return `/api/parent/finance/document?${query.toString()}`
}

function childCode(childId: string) {
  return childId.replace('student-', '').toUpperCase()
}

function formatSequence(sequence: number) {
  return String(sequence).padStart(4, '0')
}

export function findFinanceChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function listFinancePayments(childId: string) {
  const store = getStore()
  const items = store.paymentsByChild[childId] ?? []
  return [...items].sort((left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime())
}

export function submitFinancePayment(input: SubmitPaymentInput) {
  const store = getStore()
  store.sequence += 1

  const now = new Date()
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  const code = childCode(input.childId)
  const suffix = formatSequence(store.sequence)
  const invoiceRef = `INV-${code}-${stamp}-${suffix}`
  const receiptRef = `RCT-${code}-${stamp}-${suffix}`

  const entry: FinancialPaymentHistoryRecord = {
    id: `${input.childId}-live-${suffix}`,
    postedAt: now.toISOString(),
    label:
      input.mode === 'installment'
        ? `${input.installments ?? 2}-installment payment setup`
        : input.mode === 'partial'
          ? 'Partial payment'
          : 'Full payment',
    amountMad: Math.max(0, Math.round(input.amountMad)),
    method: input.gateway === 'CMI (Morocco)' ? 'CMI' : input.gateway,
    status: 'confirmed',
    invoiceRef,
    receiptRef,
    invoiceUrl: documentUrl(input.childId, 'invoice', invoiceRef),
    receiptUrl: documentUrl(input.childId, 'receipt', receiptRef),
    note: input.autoPay ? 'Payment confirmed. Recurring auto-pay is enabled.' : 'Payment confirmed. Digital receipt generated instantly.'
  }

  const existing = store.paymentsByChild[input.childId] ?? []
  store.paymentsByChild[input.childId] = [entry, ...existing].slice(0, 120)

  return {
    entry,
    confirmation: {
      message:
        input.mode === 'installment'
          ? `Installment plan confirmed with ${input.installments ?? 2} scheduled payments.`
          : 'Payment confirmed instantly.',
      receiptUrl: entry.receiptUrl
    },
    items: listFinancePayments(input.childId)
  }
}

export function listFinanceRequests(childId: string) {
  const store = getStore()
  const items = store.requestsByChild[childId] ?? []
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

export function submitFinanceRequest(input: SubmitRequestInput) {
  const store = getStore()
  store.sequence += 1

  const now = new Date().toISOString()
  const suffix = formatSequence(store.sequence)
  const code = childCode(input.childId)
  const id = `fin-req-${code}-${suffix}`.toLowerCase()

  const item: FinancialRequestRecord = {
    id,
    childId: input.childId,
    type: input.type,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
    requestedAmountMad: input.requestedAmountMad,
    detail: input.detail.trim(),
    agreementUrl: input.type === 'installment_plan' && input.agreementAccepted ? documentUrl(input.childId, 'agreement', `AGR-${code}-${suffix}`) : null,
    decisionNote: null
  }

  const existing = store.requestsByChild[input.childId] ?? []
  store.requestsByChild[input.childId] = [item, ...existing].slice(0, 120)

  return {
    item,
    items: listFinanceRequests(input.childId),
    notification: 'Financial request submitted. You will receive an approval/rejection notification once reviewed.'
  }
}

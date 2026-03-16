import { createError, readBody } from 'h3'
import { findFinanceChildById, submitFinanceRequest } from '~/server/utils/parent-finance'

interface RequestBody {
  childId?: string
  type?: 'installment_plan' | 'discount' | 'scholarship'
  requestedAmountMad?: number | null
  detail?: string
  agreementAccepted?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const type = body.type
  const detail = typeof body.detail === 'string' ? body.detail.trim() : ''
  const requestedAmountMad = typeof body.requestedAmountMad === 'number' && Number.isFinite(body.requestedAmountMad)
    ? Math.max(0, Math.round(body.requestedAmountMad))
    : null

  if (!childId || !findFinanceChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (type !== 'installment_plan' && type !== 'discount' && type !== 'scholarship') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request type' })
  }

  if (!detail) {
    throw createError({ statusCode: 400, statusMessage: 'Request detail is required' })
  }

  if (type === 'installment_plan' && !body.agreementAccepted) {
    throw createError({ statusCode: 400, statusMessage: 'Installment request requires digital agreement' })
  }

  return submitFinanceRequest({
    childId,
    type,
    requestedAmountMad,
    detail,
    agreementAccepted: Boolean(body.agreementAccepted)
  })
})

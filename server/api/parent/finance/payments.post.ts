import { createError, readBody } from 'h3'
import { findFinanceChildById, submitFinancePayment } from '~/server/utils/parent-finance'

interface PaymentBody {
  childId?: string
  gateway?: 'CMI (Morocco)' | 'Stripe' | 'PayPal'
  mode?: 'full' | 'partial' | 'installment'
  amountMad?: number
  installments?: 2 | 3 | 4 | null
  autoPay?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PaymentBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findFinanceChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (body.gateway !== 'CMI (Morocco)' && body.gateway !== 'Stripe' && body.gateway !== 'PayPal') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment gateway' })
  }

  if (body.mode !== 'full' && body.mode !== 'partial' && body.mode !== 'installment') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment mode' })
  }

  const amountMad = typeof body.amountMad === 'number' && Number.isFinite(body.amountMad) ? Math.round(body.amountMad) : 0
  if (amountMad <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment amount' })
  }

  let installments: 2 | 3 | 4 | null = null
  if (body.mode === 'installment') {
    if (body.installments !== 2 && body.installments !== 3 && body.installments !== 4) {
      throw createError({ statusCode: 400, statusMessage: 'Installment mode requires 2, 3, or 4 installments' })
    }
    installments = body.installments
  }

  return submitFinancePayment({
    childId,
    gateway: body.gateway,
    mode: body.mode,
    amountMad,
    installments,
    autoPay: Boolean(body.autoPay)
  })
})

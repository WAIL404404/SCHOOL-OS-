import { createError, readBody } from 'h3'
import { bookActivity, cancelActivityBooking, findActivityChildById } from '~/server/utils/parent-activities'

interface BookingBody {
  action?: 'book' | 'cancel'
  childId?: string
  activityId?: string
  bookingId?: string
  paymentMode?: 'pay_now' | 'invoice'
  packageDealId?: string | null
  trialSession?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BookingBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findActivityChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (body.action === 'cancel') {
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId : ''
    if (!bookingId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing booking id' })
    }

    try {
      return cancelActivityBooking({ childId, bookingId })
    } catch (error) {
      throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Cancellation failed' })
    }
  }

  if (body.action !== 'book') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking action' })
  }

  const activityId = typeof body.activityId === 'string' ? body.activityId : ''
  if (!activityId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing activity id' })
  }

  if (body.paymentMode !== 'pay_now' && body.paymentMode !== 'invoice') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payment mode' })
  }

  try {
    return bookActivity({
      childId,
      activityId,
      paymentMode: body.paymentMode,
      packageDealId: typeof body.packageDealId === 'string' ? body.packageDealId : null,
      trialSession: Boolean(body.trialSession)
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Booking failed' })
  }
})

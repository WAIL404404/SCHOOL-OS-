import { createError, readBody } from 'h3'
import { addAbsenceReason, findChildById } from '~/server/utils/parent-academics'

interface AttendanceReasonBody {
  childId?: string
  reason?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AttendanceReasonBody>(event)
  const childId = String(body?.childId ?? '').trim()
  const reason = String(body?.reason ?? '').trim()

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  if (!reason) {
    throw createError({ statusCode: 400, statusMessage: 'Missing reason' })
  }
  if (reason.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Reason is too long' })
  }

  const child = findChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child record not found' })
  }

  const { note, notification } = addAbsenceReason(childId, reason)
  return { ok: true, note, notification }
})

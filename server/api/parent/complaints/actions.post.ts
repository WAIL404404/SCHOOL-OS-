import { createError, readBody } from 'h3'
import { findComplaintChildById, getComplaintActorName, rateComplaintResolution, reopenComplaint } from '~/server/utils/parent-complaints'

interface ComplaintActionBody {
  action?: 'rate' | 'reopen'
  childId?: string
  complaintId?: string
  score?: number
  note?: string
  reason?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ComplaintActionBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const complaintId = typeof body.complaintId === 'string' ? body.complaintId : ''

  if (!childId || !findComplaintChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  if (!complaintId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing complaint id' })
  }

  try {
    if (body.action === 'rate') {
      const score = Number(body.score)
      if (!Number.isFinite(score) || score < 1 || score > 5) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid rating score' })
      }
      return rateComplaintResolution({
        childId,
        complaintId,
        score: Math.round(score) as 1 | 2 | 3 | 4 | 5,
        note: typeof body.note === 'string' ? body.note : ''
      })
    }

    if (body.action === 'reopen') {
      return reopenComplaint({
        childId,
        complaintId,
        reason: typeof body.reason === 'string' ? body.reason : '',
        actorName: getComplaintActorName(childId)
      })
    }

    throw createError({ statusCode: 400, statusMessage: 'Invalid complaint action' })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Complaint action failed' })
  }
})

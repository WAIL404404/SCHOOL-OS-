import { createError, readBody } from 'h3'
import { findContractChildById, submitContractReEnrollment } from '~/server/utils/parent-contracts'

interface ReEnrollmentBody {
  childId?: string
  requestSeatReservation?: boolean
  applyEarlyBird?: boolean
  uploadedFiles?: string[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ReEnrollmentBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const uploadedFiles = Array.isArray(body.uploadedFiles)
    ? body.uploadedFiles.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []

  if (!childId || !findContractChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  try {
    return submitContractReEnrollment({
      childId,
      requestSeatReservation: Boolean(body.requestSeatReservation),
      applyEarlyBird: Boolean(body.applyEarlyBird),
      uploadedFiles
    })
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Re-enrollment failed'
    })
  }
})

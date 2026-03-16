import { createError, readBody } from 'h3'
import { findActivityChildById, registerActivityProgram } from '~/server/utils/parent-activities'

interface ProgramBody {
  childId?: string
  programId?: string
  applyEarlyDiscount?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ProgramBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const programId = typeof body.programId === 'string' ? body.programId : ''

  if (!childId || !findActivityChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (!programId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing program id' })
  }

  try {
    return registerActivityProgram({
      childId,
      programId,
      applyEarlyDiscount: Boolean(body.applyEarlyDiscount)
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Program registration failed' })
  }
})

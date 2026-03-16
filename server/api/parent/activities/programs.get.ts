import { createError, getQuery } from 'h3'
import { findActivityChildById, listActivityProgramRegistrations, listActivityPrograms } from '~/server/utils/parent-activities'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findActivityChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  return {
    items: listActivityPrograms(childId),
    registrations: listActivityProgramRegistrations(childId)
  }
})

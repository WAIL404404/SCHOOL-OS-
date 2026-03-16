import { createError, getQuery } from 'h3'
import { findContractChildById, getContractReEnrollment } from '~/server/utils/parent-contracts'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findContractChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  return {
    item: getContractReEnrollment(childId)
  }
})

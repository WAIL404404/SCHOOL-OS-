import { createError, getQuery } from 'h3'
import { findComplaintChildById, getComplaintsRecord } from '~/server/utils/parent-complaints'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  if (!findComplaintChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const record = getComplaintsRecord(childId)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Complaints record not found' })
  }

  return record
})

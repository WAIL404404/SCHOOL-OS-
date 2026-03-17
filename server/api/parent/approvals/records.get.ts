import { createError, getQuery } from 'h3'
import { findApprovalChildById, getApprovalRecord } from '~/server/utils/parent-approvals'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findApprovalChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const record = getApprovalRecord(childId)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Approvals record not found' })
  }

  return record
})

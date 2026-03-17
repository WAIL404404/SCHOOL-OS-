import { createError, getQuery } from 'h3'
import { findMessageChildById, getMessagesRecord } from '~/server/utils/parent-messages'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }
  if (!findMessageChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const record = getMessagesRecord(childId)
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Messages record not found' })
  }

  return record
})

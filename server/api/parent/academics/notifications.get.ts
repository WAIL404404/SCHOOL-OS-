import { createError, getQuery } from 'h3'
import { findChildById, listRealtimeNotifications } from '~/server/utils/parent-academics'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = String(query.child ?? '').trim()

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  const child = findChildById(childId)
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Child record not found' })
  }

  return {
    childId,
    generatedAt: new Date().toISOString(),
    items: listRealtimeNotifications(childId)
  }
})

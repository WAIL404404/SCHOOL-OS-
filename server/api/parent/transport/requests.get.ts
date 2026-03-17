import { createError, getQuery } from 'h3'
import { findTransportChildById, listTransportRequests } from '~/server/utils/parent-transport'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findTransportChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  return {
    items: listTransportRequests(childId)
  }
})

import { createError, getQuery } from 'h3'
import { findFinanceChildById, listFinanceRequests } from '~/server/utils/parent-finance'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findFinanceChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  return { items: listFinanceRequests(childId) }
})

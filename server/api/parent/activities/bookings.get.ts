import { createError, getQuery } from 'h3'
import { childActivitiesById } from '~/shared/app/activities'
import { findActivityChildById, listActivityBookings, listActivityCatalog } from '~/server/utils/parent-activities'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findActivityChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const seed = childActivitiesById[childId]
  if (!seed) {
    throw createError({ statusCode: 404, statusMessage: 'Activities record not found' })
  }

  return {
    catalog: listActivityCatalog(childId),
    bookings: listActivityBookings(childId),
    cancellationPolicy: seed.cancellationPolicy,
    packageDeals: seed.packageDeals,
    trialSessionNote: seed.trialSessionNote
  }
})

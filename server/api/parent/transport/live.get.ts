import { createError, getQuery } from 'h3'
import { findTransportChildById, getTransportLiveFeed } from '~/server/utils/parent-transport'

function buildMapUrl(lat: number, lng: number) {
  const safeLat = Number(lat.toFixed(5))
  const safeLng = Number(lng.toFixed(5))
  return `https://www.openstreetmap.org/?mlat=${safeLat}&mlon=${safeLng}#map=14/${safeLat}/${safeLng}`
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const childId = typeof query.child === 'string' ? query.child : ''

  if (!childId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  if (!findTransportChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const payload = getTransportLiveFeed(childId)
  if (!payload) {
    throw createError({ statusCode: 404, statusMessage: 'Transport record not found' })
  }

  const latestPoint = payload.livePoints.length
    ? [...payload.livePoints].sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())[0] ?? null
    : null

  return {
    routeName: payload.routeName,
    mapUrl: latestPoint ? buildMapUrl(latestPoint.position.lat, latestPoint.position.lng) : null,
    latestPoint,
    routeHistory: payload.routeHistory,
    notifications: payload.notifications,
    geofenceAlerts: payload.geofenceAlerts,
    stops: payload.stops,
    routeUpdates: payload.routeUpdates,
    alternativeRoute: payload.alternativeRoute,
    driver: payload.driver
  }
})

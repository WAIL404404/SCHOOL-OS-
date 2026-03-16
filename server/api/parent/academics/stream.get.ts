import { createError, getQuery, setHeader } from 'h3'
import type { H3Event } from 'h3'
import { findChildById, listRealtimeNotifications } from '~/server/utils/parent-academics'

function sendEvent(event: H3Event, eventName: string, payload: unknown) {
  event.node.res.write(`event: ${eventName}\n`)
  event.node.res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

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

  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  if (event.node.res.flushHeaders) {
    event.node.res.flushHeaders()
  }

  const seenNotificationIds = new Set<string>()
  const firstItems = listRealtimeNotifications(childId)
  for (const item of firstItems) {
    seenNotificationIds.add(item.id)
  }
  sendEvent(event, 'snapshot', { childId, items: firstItems })

  const interval = setInterval(() => {
    if (event.node.res.writableEnded || event.node.res.destroyed) return

    const latestItems = listRealtimeNotifications(childId)
    let sentCount = 0
    for (const item of latestItems) {
      if (seenNotificationIds.has(item.id)) continue
      seenNotificationIds.add(item.id)
      sendEvent(event, 'notification', { childId, item })
      sentCount += 1
    }

    if (sentCount === 0) {
      sendEvent(event, 'heartbeat', { childId, at: new Date().toISOString() })
    }
  }, 5000)

  const cleanup = () => {
    clearInterval(interval)
    if (!event.node.res.writableEnded) {
      event.node.res.end()
    }
  }

  event.node.req.on('close', cleanup)
  event.node.req.on('aborted', cleanup)

  return new Promise<void>((resolve) => {
    event.node.req.on('close', () => resolve())
    event.node.req.on('aborted', () => resolve())
  })
})

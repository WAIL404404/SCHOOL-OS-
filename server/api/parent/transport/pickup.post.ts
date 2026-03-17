import { createError, readBody } from 'h3'
import {
  addTransportPickupPerson,
  findTransportChildById,
  scanTransportPickup
} from '~/server/utils/parent-transport'

interface PickupBody {
  action?: 'add_person' | 'scan'
  childId?: string
  fullName?: string
  relationship?: string
  temporary?: boolean
  expiresAt?: string | null
  photoIdLabel?: string
  qrCode?: string
  event?: 'pickup' | 'dropoff'
  actorName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PickupBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findTransportChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (body.action === 'add_person') {
    try {
      return addTransportPickupPerson({
        childId,
        fullName: typeof body.fullName === 'string' ? body.fullName : '',
        relationship: typeof body.relationship === 'string' ? body.relationship : '',
        temporary: Boolean(body.temporary),
        expiresAt: typeof body.expiresAt === 'string' && body.expiresAt.length > 0 ? body.expiresAt : null,
        photoIdLabel: typeof body.photoIdLabel === 'string' ? body.photoIdLabel : ''
      })
    } catch (error) {
      throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Failed to add pickup person' })
    }
  }

  if (body.action === 'scan') {
    if (body.event !== 'pickup' && body.event !== 'dropoff') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid pickup event' })
    }

    try {
      return scanTransportPickup({
        childId,
        qrCode: typeof body.qrCode === 'string' ? body.qrCode : '',
        event: body.event,
        actorName: typeof body.actorName === 'string' ? body.actorName : undefined
      })
    } catch (error) {
      throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'QR scan failed' })
    }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid pickup action' })
})

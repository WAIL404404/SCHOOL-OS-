import { createError, readBody } from 'h3'
import {
  findMessageChildById,
  requestAppointment,
  updateAppointment
} from '~/server/utils/parent-messages'

interface AppointmentBody {
  action?: 'request' | 'confirm' | 'reschedule' | 'cancel'
  childId?: string
  participantId?: string
  slotId?: string
  purpose?: string
  appointmentId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AppointmentBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findMessageChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  try {
    if (body.action === 'request') {
      const participantId = typeof body.participantId === 'string' ? body.participantId : ''
      const slotId = typeof body.slotId === 'string' ? body.slotId : ''
      return requestAppointment({
        childId,
        participantId,
        slotId,
        purpose: typeof body.purpose === 'string' ? body.purpose : ''
      })
    }

    if (body.action === 'confirm' || body.action === 'reschedule' || body.action === 'cancel') {
      const appointmentId = typeof body.appointmentId === 'string' ? body.appointmentId : ''
      if (!appointmentId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing appointment id' })
      }
      return updateAppointment({
        childId,
        appointmentId,
        action: body.action,
        slotId: typeof body.slotId === 'string' ? body.slotId : undefined
      })
    }

    throw createError({ statusCode: 400, statusMessage: 'Invalid appointment action' })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Appointment update failed' })
  }
})

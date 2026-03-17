import { createError, readBody } from 'h3'
import { findMessageChildById, markAnnouncementRead } from '~/server/utils/parent-messages'

interface AnnouncementBody {
  childId?: string
  announcementId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AnnouncementBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const announcementId = typeof body.announcementId === 'string' ? body.announcementId : ''

  if (!childId || !findMessageChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  if (!announcementId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing announcement id' })
  }

  try {
    return markAnnouncementRead({ childId, announcementId })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Announcement update failed' })
  }
})

import { createError, readBody } from 'h3'
import type { CommunicationNotificationPreferencesRecord } from '~/shared/app/types'
import { findMessageChildById, updateMessagePreferences } from '~/server/utils/parent-messages'

interface PreferencesBody {
  childId?: string
  preferences?: CommunicationNotificationPreferencesRecord
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PreferencesBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findMessageChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  if (!body.preferences) {
    throw createError({ statusCode: 400, statusMessage: 'Missing preferences payload' })
  }

  try {
    return updateMessagePreferences({
      childId,
      preferences: body.preferences
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Preferences update failed' })
  }
})

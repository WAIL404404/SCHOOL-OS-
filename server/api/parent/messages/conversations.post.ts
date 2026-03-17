import { createError, readBody } from 'h3'
import { archiveConversation, findMessageChildById, sendConversationMessage } from '~/server/utils/parent-messages'

interface ConversationBody {
  action?: 'send' | 'archive' | 'restore'
  childId?: string
  conversationId?: string
  body?: string
  attachmentKind?: 'image' | 'file' | 'voice_note' | 'pdf' | 'video' | 'none'
  attachmentLabel?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ConversationBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const conversationId = typeof body.conversationId === 'string' ? body.conversationId : ''

  if (!childId || !findMessageChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing conversation id' })
  }

  try {
    if (body.action === 'send') {
      const attachmentKind = body.attachmentKind ?? 'none'
      if (!['image', 'file', 'voice_note', 'pdf', 'video', 'none'].includes(attachmentKind)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid attachment kind' })
      }
      return sendConversationMessage({
        childId,
        conversationId,
        body: typeof body.body === 'string' ? body.body : '',
        attachmentKind,
        attachmentLabel: typeof body.attachmentLabel === 'string' ? body.attachmentLabel : ''
      })
    }

    if (body.action === 'archive' || body.action === 'restore') {
      return archiveConversation({
        childId,
        conversationId,
        archived: body.action === 'archive'
      })
    }

    throw createError({ statusCode: 400, statusMessage: 'Invalid conversation action' })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Conversation update failed' })
  }
})

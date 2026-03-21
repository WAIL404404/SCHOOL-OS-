import { createError, readBody } from 'h3'
import type { ComplaintCategory, ComplaintModuleAttachmentRecord, ComplaintPriority } from '~/shared/app/types'
import { findComplaintChildById, getComplaintActorName, submitComplaint } from '~/server/utils/parent-complaints'

interface SubmitComplaintBody {
  childId?: string
  title?: string
  category?: ComplaintCategory
  description?: string
  priority?: ComplaintPriority
  anonymous?: boolean
  attachments?: Array<{
    kind?: ComplaintModuleAttachmentRecord['kind']
    label?: string
  }>
}

const validCategories: ComplaintCategory[] = ['academic', 'behavior', 'facilities', 'transport', 'cantine_food', 'safety_security', 'staff_behavior', 'other']
const validPriorities: ComplaintPriority[] = ['low', 'medium', 'high', 'urgent']
const validAttachmentKinds: ComplaintModuleAttachmentRecord['kind'][] = ['image', 'file', 'pdf', 'link']

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitComplaintBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findComplaintChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const category = body.category
  if (!category || !validCategories.includes(category)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid complaint category' })
  }

  const priority = body.priority
  if (!priority || !validPriorities.includes(priority)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid complaint priority' })
  }

  const attachments = Array.isArray(body.attachments)
    ? body.attachments
      .filter((item) => item && typeof item.label === 'string' && item.label.trim().length > 0)
      .map((item) => ({
        kind: validAttachmentKinds.includes(item.kind ?? 'file') ? (item.kind ?? 'file') : 'file',
        label: String(item.label).trim()
      }))
    : []

  try {
    return submitComplaint({
      childId,
      title: typeof body.title === 'string' ? body.title : '',
      category,
      description: typeof body.description === 'string' ? body.description : '',
      priority,
      anonymous: Boolean(body.anonymous),
      attachments,
      actorName: getComplaintActorName(childId)
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Complaint could not be submitted' })
  }
})

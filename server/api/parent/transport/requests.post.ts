import { createError, readBody } from 'h3'
import {
  findTransportChildById,
  submitTransportRequest
} from '~/server/utils/parent-transport'
import type { TransportRequestRecord } from '~/shared/app/types'

interface RequestBody {
  childId?: string
  type?: TransportRequestRecord['type']
  detail?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''

  if (!childId || !findTransportChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  const type = body.type
  if (type !== 'service_request' && type !== 'skip_once' && type !== 'change_stop' && type !== 'issue_report') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request type' })
  }

  try {
    return submitTransportRequest({
      childId,
      type,
      detail: typeof body.detail === 'string' ? body.detail : ''
    })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Transport request failed' })
  }
})

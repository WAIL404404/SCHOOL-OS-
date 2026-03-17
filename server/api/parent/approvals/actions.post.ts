import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import {
  findApprovalChildById,
  getApprovalActorName,
  revokeApproval,
  signApproval
} from '~/server/utils/parent-approvals'

interface ApprovalActionBody {
  action?: 'sign' | 'revoke'
  childId?: string
  approvalId?: string
  reason?: string
}

function resolveClientIp(event: H3Event) {
  const forwarded = event.node.req.headers['x-forwarded-for']
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0]
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0]?.trim() || '127.0.0.1'
  return event.node.req.socket.remoteAddress || '127.0.0.1'
}

function resolveDeviceInfo(event: H3Event) {
  const userAgent = event.node.req.headers['user-agent']
  return typeof userAgent === 'string' && userAgent.trim().length > 0 ? userAgent.trim() : 'Unknown device'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ApprovalActionBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const approvalId = typeof body.approvalId === 'string' ? body.approvalId : ''

  if (!childId || !findApprovalChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }
  if (!approvalId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing approval id' })
  }

  const actorName = getApprovalActorName(childId)
  const ipAddress = resolveClientIp(event)
  const deviceInfo = resolveDeviceInfo(event)

  try {
    if (body.action === 'sign') {
      return signApproval({
        childId,
        approvalId,
        actorName,
        ipAddress,
        deviceInfo
      })
    }

    if (body.action === 'revoke') {
      return revokeApproval({
        childId,
        approvalId,
        actorName,
        ipAddress,
        deviceInfo,
        reason: typeof body.reason === 'string' ? body.reason : ''
      })
    }

    throw createError({ statusCode: 400, statusMessage: 'Invalid approval action' })
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Approval action failed' })
  }
})

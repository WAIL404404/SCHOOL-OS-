import type { H3Event } from 'h3'
import { createError, readBody } from 'h3'
import { findContractChildById, signContract } from '~/server/utils/parent-contracts'

interface SignatureBody {
  childId?: string
  roleId?: 'parent_1' | 'parent_2'
}

function resolveClientIp(event: H3Event) {
  const forwarded = event.node.req.headers['x-forwarded-for']
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0]
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0]?.trim() || '127.0.0.1'
  const socketAddress = event.node.req.socket.remoteAddress
  return socketAddress || '127.0.0.1'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SignatureBody>(event)
  const childId = typeof body.childId === 'string' ? body.childId : ''
  const roleId = body.roleId

  if (!childId || !findContractChildById(childId)) {
    throw createError({ statusCode: 404, statusMessage: 'Child not found' })
  }

  if (roleId !== 'parent_1' && roleId !== 'parent_2') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid signer role' })
  }

  try {
    return signContract({
      childId,
      roleId,
      ipAddress: resolveClientIp(event)
    })
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Signature failed'
    })
  }
})

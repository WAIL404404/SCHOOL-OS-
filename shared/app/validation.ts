import { z } from 'zod'

export const credentialLoginSchema = z.object({
  schoolCode: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6)
})

export const accessCodeLoginSchema = z.object({
  schoolCode: z.string().trim().min(2),
  accessCode: z.string().trim().min(6)
})

export const loginSchema = z.discriminatedUnion('mode', [
  credentialLoginSchema.extend({ mode: z.literal('credentials') }),
  accessCodeLoginSchema.extend({ mode: z.literal('access-code') })
])

export const recoverySchema = z.object({
  schoolCode: z.string().trim().min(2),
  email: z.string().trim().email(),
  channel: z.enum(['sms', 'whatsapp'])
})

export const inviteQuerySchema = z.object({
  invite: z.string().trim().min(4).optional().nullable()
})

export const childQuerySchema = z.object({
  child: z.string().trim().min(2).optional().nullable()
})

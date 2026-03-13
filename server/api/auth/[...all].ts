import { toWebRequest } from 'h3'
import { getBetterAuth } from '~/server/utils/better-auth'

export default defineEventHandler(async (event) => {
  const auth = getBetterAuth()
  return auth.handler(toWebRequest(event))
})

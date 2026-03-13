import { createAuthClient } from 'better-auth/vue'
import { organizationClient } from 'better-auth/client/plugins'

let authClient: ReturnType<typeof createAuthClient> | null = null

export function useBetterAuthClient() {
  if (!authClient) {
    authClient = createAuthClient({
      baseURL: '/api/auth',
      plugins: [organizationClient()]
    })
  }

  return authClient
}

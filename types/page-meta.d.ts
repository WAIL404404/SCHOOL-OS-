import type { UserRole } from '~/shared/app/types'

declare module '#app' {
  interface PageMeta {
    guestOnly?: boolean
    onboardingOnly?: boolean
    pageRole?: UserRole
  }
}

export {}

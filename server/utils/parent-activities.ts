import { childActivitiesById } from '~/shared/app/activities'
import { seedParentAccounts } from '~/shared/app/data'
import type { ActivityBookingRecord, ActivityCatalogRecord, ActivityProgramRecord, ActivityProgramRegistrationRecord, ActivityTrackingRecord } from '~/shared/app/types'

interface ParentActivitiesStore {
  sequence: number
  catalogByChild: Record<string, ActivityCatalogRecord[]>
  bookingsByChild: Record<string, ActivityBookingRecord[]>
  programsByChild: Record<string, ActivityProgramRecord[]>
  registrationsByChild: Record<string, ActivityProgramRegistrationRecord[]>
}

interface BookActivityInput {
  childId: string
  activityId: string
  paymentMode: 'pay_now' | 'invoice'
  packageDealId: string | null
  trialSession: boolean
}

interface CancelBookingInput {
  childId: string
  bookingId: string
}

interface RegisterProgramInput {
  childId: string
  programId: string
  applyEarlyDiscount: boolean
}

function cloneCatalog(items: ActivityCatalogRecord[]) {
  return items.map((item) => ({
    ...item,
    instructor: { ...item.instructor, qualifications: [...item.instructor.qualifications] },
    price: { ...item.price },
    media: item.media.map((asset) => ({ ...asset })),
    reviews: item.reviews.map((review) => ({ ...review }))
  }))
}

function cloneBookings(items: ActivityBookingRecord[]) {
  return items.map((item) => ({ ...item }))
}

function clonePrograms(items: ActivityProgramRecord[]) {
  return items.map((item) => ({ ...item }))
}

function cloneRegistrations(items: ActivityProgramRegistrationRecord[]) {
  return items.map((item) => ({ ...item }))
}

function createStore(): ParentActivitiesStore {
  const catalogByChild: ParentActivitiesStore['catalogByChild'] = {}
  const bookingsByChild: ParentActivitiesStore['bookingsByChild'] = {}
  const programsByChild: ParentActivitiesStore['programsByChild'] = {}
  const registrationsByChild: ParentActivitiesStore['registrationsByChild'] = {}

  for (const [childId, record] of Object.entries(childActivitiesById)) {
    catalogByChild[childId] = cloneCatalog(record.catalog)
    bookingsByChild[childId] = cloneBookings(record.bookings)
    programsByChild[childId] = clonePrograms(record.programs)
    registrationsByChild[childId] = cloneRegistrations(record.programRegistrations)
  }

  return {
    sequence: 0,
    catalogByChild,
    bookingsByChild,
    programsByChild,
    registrationsByChild
  }
}

function getStore() {
  const key = '__school_os_parent_activities_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentActivitiesStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentActivitiesStore
}

function nowIso() {
  return new Date().toISOString()
}

function pad(value: number, size: number) {
  return String(value).padStart(size, '0')
}

function bookingCode(childId: string, sequence: number) {
  const token = childId.replace('student-', '').slice(0, 6).toUpperCase()
  return `ACT-${token}-${pad(sequence, 4)}`
}

function seatCode(childId: string, sequence: number) {
  const token = childId.replace('student-', '').slice(0, 6).toUpperCase()
  return `PRG-${token}-${pad(sequence, 4)}`
}

function sortBookings(items: ActivityBookingRecord[]) {
  return [...items].sort((left, right) => new Date(right.bookedAt).getTime() - new Date(left.bookedAt).getTime())
}

function sessionStartForActivity(activityId: string) {
  const now = new Date()
  now.setDate(now.getDate() + 7)
  now.setHours(16, 0, 0, 0)
  if (activityId.includes('swim')) now.setHours(17, 0, 0, 0)
  if (activityId.includes('theater') || activityId.includes('debate')) now.setHours(15, 30, 0, 0)
  return now
}

function ensureActivityRecord(childId: string) {
  return childActivitiesById[childId] ?? null
}

function findCatalogActivity(catalog: ActivityCatalogRecord[], activityId: string) {
  return catalog.find((item) => item.id === activityId) ?? null
}

export function findActivityChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function listActivityCatalog(childId: string) {
  const store = getStore()
  return cloneCatalog(store.catalogByChild[childId] ?? [])
}

export function listActivityBookings(childId: string) {
  const store = getStore()
  return sortBookings(store.bookingsByChild[childId] ?? [])
}

export function listActivityTracking(childId: string): ActivityTrackingRecord[] {
  const record = ensureActivityRecord(childId)
  if (!record) return []
  return record.tracking.map((item) => ({
    ...item,
    weeklyReports: item.weeklyReports.map((row) => ({ ...row })),
    sessionMedia: item.sessionMedia.map((row) => ({ ...row })),
    skillAssessment: item.skillAssessment.map((row) => ({ ...row })),
    attendance: item.attendance.map((row) => ({ ...row }))
  }))
}

export function listActivityPrograms(childId: string) {
  const store = getStore()
  const items = store.programsByChild[childId] ?? []
  return clonePrograms(items).sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
}

export function listActivityProgramRegistrations(childId: string) {
  const store = getStore()
  const items = store.registrationsByChild[childId] ?? []
  return cloneRegistrations(items).sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

export function bookActivity(input: BookActivityInput) {
  const store = getStore()
  const catalog = store.catalogByChild[input.childId] ?? []
  const activity = findCatalogActivity(catalog, input.activityId)
  if (!activity) {
    throw new Error('Activity not found')
  }

  store.sequence += 1
  const id = `book-live-${pad(store.sequence, 4)}`
  const bookedAt = nowIso()
  const sessionStart = sessionStartForActivity(activity.id)
  const cancellationDeadline = new Date(sessionStart.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const waitlistPosition = activity.spotsRemaining <= 0
    ? (store.bookingsByChild[input.childId] ?? []).filter((item) => item.activityId === activity.id && item.status === 'waitlist').length + 1
    : null

  const entry: ActivityBookingRecord = {
    id,
    childId: input.childId,
    activityId: activity.id,
    activityName: activity.name,
    status: activity.spotsRemaining <= 0 ? 'waitlist' : 'confirmed',
    bookedAt,
    sessionStartsAt: sessionStart.toISOString(),
    cancellationDeadline,
    paymentMode: input.paymentMode,
    paymentStatus: input.paymentMode === 'pay_now' ? 'paid' : 'pending_invoice',
    packageDealId: input.packageDealId,
    trialSession: input.trialSession,
    waitlistPosition,
    confirmationCode: waitlistPosition ? null : bookingCode(input.childId, store.sequence)
  }

  const bookings = store.bookingsByChild[input.childId] ?? []
  store.bookingsByChild[input.childId] = [entry, ...bookings].slice(0, 150)

  if (!waitlistPosition) {
    activity.spotsRemaining = Math.max(0, activity.spotsRemaining - 1)
  }

  return {
    entry,
    catalog: listActivityCatalog(input.childId),
    bookings: listActivityBookings(input.childId),
    message: waitlistPosition
      ? `Activity is full. Waitlist joined at position #${waitlistPosition}. Auto-notification will be sent when a spot opens.`
      : `Booking confirmed instantly. Confirmation code ${entry.confirmationCode}.`
  }
}

export function cancelActivityBooking(input: CancelBookingInput) {
  const store = getStore()
  const bookings = store.bookingsByChild[input.childId] ?? []
  const target = bookings.find((item) => item.id === input.bookingId)
  if (!target) {
    throw new Error('Booking not found')
  }
  if (target.status === 'cancelled') {
    return {
      bookings: listActivityBookings(input.childId),
      catalog: listActivityCatalog(input.childId),
      message: 'This booking was already cancelled.'
    }
  }

  const nowMs = Date.now()
  const deadlineMs = new Date(target.cancellationDeadline).getTime()
  if (target.status === 'confirmed' && Number.isFinite(deadlineMs) && nowMs > deadlineMs) {
    throw new Error('Cancellation deadline has passed for this booking.')
  }

  const wasConfirmed = target.status === 'confirmed'
  target.status = 'cancelled'
  target.waitlistPosition = null
  target.confirmationCode = null

  let promotionNote = ''
  const catalog = store.catalogByChild[input.childId] ?? []
  const activity = catalog.find((item) => item.id === target.activityId)
  if (wasConfirmed && activity) {
    activity.spotsRemaining += 1

    const waitlist = bookings
      .filter((item) => item.activityId === target.activityId && item.status === 'waitlist')
      .sort((left, right) => new Date(left.bookedAt).getTime() - new Date(right.bookedAt).getTime())

    const promoted = waitlist[0]
    if (promoted) {
      store.sequence += 1
      promoted.status = 'confirmed'
      promoted.waitlistPosition = null
      promoted.confirmationCode = bookingCode(input.childId, store.sequence)
      promoted.paymentStatus = promoted.paymentMode === 'pay_now' ? 'paid' : 'pending_invoice'
      activity.spotsRemaining = Math.max(0, activity.spotsRemaining - 1)
      promotionNote = ` Waitlist auto-notification sent and ${promoted.activityName} booking was promoted to confirmed.`
    }
  }

  return {
    bookings: listActivityBookings(input.childId),
    catalog: listActivityCatalog(input.childId),
    message: `Booking cancelled successfully.${promotionNote}`
  }
}

export function registerActivityProgram(input: RegisterProgramInput) {
  const store = getStore()
  const programs = store.programsByChild[input.childId] ?? []
  const program = programs.find((item) => item.id === input.programId)
  if (!program) {
    throw new Error('Program not found')
  }

  if (program.availableSpots <= 0) {
    throw new Error('No spots remaining for this program.')
  }

  const existing = (store.registrationsByChild[input.childId] ?? []).find((item) => item.programId === input.programId)
  if (existing && existing.status !== 'confirmed') {
    existing.status = 'under_review'
    existing.updatedAt = nowIso()
    return {
      item: { ...existing },
      programs: listActivityPrograms(input.childId),
      registrations: listActivityProgramRegistrations(input.childId),
      message: 'Program registration is already submitted and now marked under review.'
    }
  }
  if (existing && existing.status === 'confirmed') {
    return {
      item: { ...existing },
      programs: listActivityPrograms(input.childId),
      registrations: listActivityProgramRegistrations(input.childId),
      message: `Program already confirmed. Seat code ${existing.seatCode ?? 'pending'}.`
    }
  }

  store.sequence += 1
  const submittedAt = nowIso()
  const immediateConfirm = program.kind === 'holiday_workshop'
  const item: ActivityProgramRegistrationRecord = {
    id: `reg-live-${pad(store.sequence, 4)}`,
    childId: input.childId,
    programId: program.id,
    status: immediateConfirm ? 'confirmed' : 'under_review',
    submittedAt,
    updatedAt: submittedAt,
    seatCode: immediateConfirm ? seatCode(input.childId, store.sequence) : null,
    discountAppliedMad: input.applyEarlyDiscount ? (program.earlyRegistrationDiscountMad ?? null) : null
  }

  const registrations = store.registrationsByChild[input.childId] ?? []
  store.registrationsByChild[input.childId] = [item, ...registrations].slice(0, 120)
  program.availableSpots = Math.max(0, program.availableSpots - 1)

  return {
    item: { ...item },
    programs: listActivityPrograms(input.childId),
    registrations: listActivityProgramRegistrations(input.childId),
    message: immediateConfirm
      ? `Registration confirmed instantly. Seat code ${item.seatCode}.`
      : 'Registration submitted and moved to under-review status.'
  }
}

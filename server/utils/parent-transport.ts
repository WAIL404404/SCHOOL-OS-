import { seedParentAccounts } from '~/shared/app/data'
import { childTransportById } from '~/shared/app/transport'
import type {
  ChildTransportModuleRecord,
  TransportNotificationRecord,
  TransportPickupLogRecord,
  TransportPickupPersonRecord,
  TransportRequestRecord,
  TransportRouteStopRecord
} from '~/shared/app/types'

interface ParentTransportStore {
  sequence: number
  byChild: Record<string, ChildTransportModuleRecord>
}

interface SubmitTransportRequestInput {
  childId: string
  type: TransportRequestRecord['type']
  detail: string
}

interface AddPickupPersonInput {
  childId: string
  fullName: string
  relationship: string
  temporary: boolean
  expiresAt: string | null
  photoIdLabel: string
}

interface ScanPickupInput {
  childId: string
  qrCode: string
  event: 'pickup' | 'dropoff'
  actorName?: string
}

function cloneStops(items: TransportRouteStopRecord[]) {
  return items.map((item) => ({ ...item }))
}

function cloneNotifications(items: TransportNotificationRecord[]) {
  return items.map((item) => ({ ...item }))
}

function clonePickupPersons(items: TransportPickupPersonRecord[]) {
  return items.map((item) => ({ ...item }))
}

function clonePickupLog(items: TransportPickupLogRecord[]) {
  return items.map((item) => ({ ...item }))
}

function cloneRequests(items: TransportRequestRecord[]) {
  return items.map((item) => ({ ...item }))
}

function cloneRecord(record: ChildTransportModuleRecord): ChildTransportModuleRecord {
  return {
    ...record,
    livePoints: record.livePoints.map((item) => ({ ...item, position: { ...item.position } })),
    routeHistory: record.routeHistory.map((item) => ({ ...item, position: { ...item.position } })),
    notifications: cloneNotifications(record.notifications),
    stops: cloneStops(record.stops),
    routeUpdates: [...record.routeUpdates],
    driver: { ...record.driver },
    geofenceAlerts: record.geofenceAlerts.map((item) => ({ ...item })),
    pickupPersons: clonePickupPersons(record.pickupPersons),
    pickupLog: clonePickupLog(record.pickupLog),
    requests: cloneRequests(record.requests)
  }
}

function createStore(): ParentTransportStore {
  const byChild: ParentTransportStore['byChild'] = {}

  for (const [childId, record] of Object.entries(childTransportById)) {
    byChild[childId] = cloneRecord(record)
  }

  return {
    sequence: 0,
    byChild
  }
}

function getStore() {
  const key = '__school_os_parent_transport_store__'
  const globalState = globalThis as typeof globalThis & { [key: string]: ParentTransportStore | undefined }
  if (!globalState[key]) {
    globalState[key] = createStore()
  }
  return globalState[key] as ParentTransportStore
}

function nowIso() {
  return new Date().toISOString()
}

function pad(value: number, size: number) {
  return String(value).padStart(size, '0')
}

function personQrCode(childId: string, sequence: number) {
  const childToken = childId.replace('student-', '').slice(0, 6).toUpperCase()
  return `ALT-${childToken}-${pad(sequence, 4)}`
}

function findParentNameForChild(childId: string) {
  const parent = seedParentAccounts.find((account) => account.children.some((child) => child.id === childId))
  return parent?.profile.displayName ?? 'Parent'
}

function ensureRecord(childId: string) {
  const store = getStore()
  return store.byChild[childId] ?? null
}

function sortByUpdatedAt(items: TransportRequestRecord[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

function sortLogNewestFirst(items: TransportPickupLogRecord[]) {
  return [...items].sort((left, right) => new Date(right.happenedAt).getTime() - new Date(left.happenedAt).getTime())
}

function sortStops(items: TransportRouteStopRecord[]) {
  return [...items].sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime())
}

export function findTransportChildById(childId: string) {
  return seedParentAccounts.flatMap((account) => account.children).find((child) => child.id === childId) ?? null
}

export function getTransportLiveFeed(childId: string) {
  const record = ensureRecord(childId)
  if (!record) return null

  const livePoints = record.livePoints.map((item) => ({ ...item, position: { ...item.position } }))
  const routeHistory = record.routeHistory.map((item) => ({ ...item, position: { ...item.position } }))

  return {
    routeName: record.routeName,
    alternativeRoute: record.alternativeRoute,
    livePoints,
    routeHistory,
    notifications: cloneNotifications(record.notifications).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    stops: sortStops(cloneStops(record.stops)),
    routeUpdates: [...record.routeUpdates],
    driver: { ...record.driver },
    geofenceAlerts: record.geofenceAlerts.map((item) => ({ ...item })).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }
}

export function getTransportPickupState(childId: string) {
  const record = ensureRecord(childId)
  if (!record) return null

  return {
    parentQrCode: record.parentQrCode,
    persons: clonePickupPersons(record.pickupPersons),
    log: sortLogNewestFirst(clonePickupLog(record.pickupLog))
  }
}

export function listTransportRequests(childId: string) {
  const record = ensureRecord(childId)
  if (!record) return []
  return sortByUpdatedAt(cloneRequests(record.requests))
}

export function submitTransportRequest(input: SubmitTransportRequestInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) {
    throw new Error('Transport record not found')
  }

  const detail = input.detail.trim()
  if (!detail) {
    throw new Error('Request detail is required')
  }

  store.sequence += 1
  const timestamp = nowIso()
  const entry: TransportRequestRecord = {
    id: `transport-live-req-${pad(store.sequence, 4)}`,
    type: input.type,
    status: input.type === 'skip_once' ? 'approved' : 'submitted',
    detail,
    createdAt: timestamp,
    updatedAt: timestamp
  }

  record.requests = [entry, ...record.requests].slice(0, 160)

  return {
    item: { ...entry },
    items: listTransportRequests(input.childId),
    message: entry.status === 'approved'
      ? 'One-time skip approved and shared with the route supervisor.'
      : 'Transport request submitted. You will be notified when reviewed.'
  }
}

export function addTransportPickupPerson(input: AddPickupPersonInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) {
    throw new Error('Transport record not found')
  }

  const fullName = input.fullName.trim()
  const relationship = input.relationship.trim()
  const photoIdLabel = input.photoIdLabel.trim()

  if (!fullName || !relationship || !photoIdLabel) {
    throw new Error('Full name, relationship, and photo ID are required')
  }

  store.sequence += 1
  const next: TransportPickupPersonRecord = {
    id: `pickup-person-live-${pad(store.sequence, 4)}`,
    fullName,
    relationship,
    temporary: input.temporary,
    expiresAt: input.temporary ? input.expiresAt : null,
    qrCode: personQrCode(input.childId, store.sequence),
    photoIdLabel
  }

  record.pickupPersons = [next, ...record.pickupPersons].slice(0, 60)

  return {
    item: { ...next },
    persons: clonePickupPersons(record.pickupPersons),
    log: sortLogNewestFirst(clonePickupLog(record.pickupLog)),
    message: `${fullName} was added as an authorized pickup person.`
  }
}

export function scanTransportPickup(input: ScanPickupInput) {
  const store = getStore()
  const record = store.byChild[input.childId]
  if (!record) {
    throw new Error('Transport record not found')
  }

  const qr = input.qrCode.trim()
  if (!qr) {
    throw new Error('QR code is required')
  }

  const timestamp = nowIso()
  const matchingPerson = record.pickupPersons.find((item) => item.qrCode === qr)
  const parentMatch = record.parentQrCode === qr

  const personExpired = Boolean(
    matchingPerson?.temporary
    && matchingPerson.expiresAt
    && new Date(matchingPerson.expiresAt).getTime() < new Date(timestamp).getTime()
  )

  const authorized = (parentMatch || Boolean(matchingPerson)) && !personExpired
  const actorName = parentMatch
    ? findParentNameForChild(input.childId)
    : (matchingPerson?.fullName ?? input.actorName?.trim()) || 'Unknown person'

  store.sequence += 1
  const event: TransportPickupLogRecord['event'] = authorized ? input.event : 'unauthorized_attempt'
  const note = authorized
    ? `${input.event === 'pickup' ? 'Pickup' : 'Drop-off'} verified by QR scan.`
    : personExpired
      ? 'QR matched a temporary profile but it has expired.'
      : 'Unauthorized QR scan attempt blocked.'

  const entry: TransportPickupLogRecord = {
    id: `pickup-scan-live-${pad(store.sequence, 4)}`,
    event,
    actorName,
    authorized,
    happenedAt: timestamp,
    note
  }

  record.pickupLog = [entry, ...record.pickupLog].slice(0, 220)

  return {
    authorized,
    entry: { ...entry },
    persons: clonePickupPersons(record.pickupPersons),
    log: sortLogNewestFirst(clonePickupLog(record.pickupLog)),
    message: authorized
      ? `${input.event === 'pickup' ? 'Pickup' : 'Drop-off'} confirmed for ${actorName}.`
      : `Unauthorized pickup attempt recorded for ${actorName}. School supervision was notified.`
  }
}

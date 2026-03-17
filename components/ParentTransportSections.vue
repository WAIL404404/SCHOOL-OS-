<script setup lang="ts">
import { motion } from 'motion-v'
import type {
  ParentTransportView,
  TransportPickupLogRecord,
  TransportPickupPersonRecord,
  TransportRequestRecord,
  TransportRouteStopRecord
} from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentTransportView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const requestType = ref<TransportRequestRecord['type']>('service_request')
const requestDetail = ref('')
const requestLoading = ref(false)
const requestFeedback = ref('')
const requestFeedbackTone = ref<'success' | 'error'>('success')

const fullName = ref('')
const relationship = ref('')
const temporary = ref(false)
const expiresAtLocal = ref('')
const photoIdLabel = ref('')
const pickupLoading = ref(false)
const pickupFeedback = ref('')
const pickupFeedbackTone = ref<'success' | 'error'>('success')

const scanQrCode = ref('')
const scanEvent = ref<'pickup' | 'dropoff'>('pickup')
const scanActorName = ref('')

const liveTrackingState = ref<ParentTransportView['liveTracking'] | null>(null)
const routeInfoState = ref<ParentTransportView['routeInfo'] | null>(null)
const pickupState = ref<ParentTransportView['pickup'] | null>(null)
const requestItemsState = ref<TransportRequestRecord[]>([])
const transportFeedLoading = ref(false)
const transportFeedError = ref('')

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    requestFeedback.value = ''
    pickupFeedback.value = ''
    transportFeedError.value = ''
    requestDetail.value = ''
    fullName.value = ''
    relationship.value = ''
    temporary.value = false
    expiresAtLocal.value = ''
    photoIdLabel.value = ''
    scanActorName.value = ''
    void refreshTransportFeed(childId)
  },
  { immediate: true }
)

const liveTracking = computed(() => liveTrackingState.value ?? props.viewModel.liveTracking)
const routeInfo = computed(() => routeInfoState.value ?? props.viewModel.routeInfo)
const pickup = computed(() => pickupState.value ?? props.viewModel.pickup)
const requestItems = computed(() => (requestItemsState.value.length ? requestItemsState.value : props.viewModel.requests.items))

watch(
  pickup,
  (value) => {
    if (!scanQrCode.value && value.parentQrCode) {
      scanQrCode.value = value.parentQrCode
    }
  },
  { immediate: true, deep: true }
)

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function requestTypeLabel(type: TransportRequestRecord['type']) {
  if (type === 'service_request') return 'Request transport service'
  if (type === 'skip_once') return 'One-time skip'
  if (type === 'change_stop') return 'Change pickup/drop-off point'
  return 'Report issue'
}

function requestStatusClass(status: TransportRequestRecord['status']) {
  if (status === 'approved' || status === 'completed') return 'status-pill'
  if (status === 'rejected') return 'status-pill status-pill--alert'
  if (status === 'reviewing') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function stopStatusClass(status: TransportRouteStopRecord['status']) {
  if (status === 'served') return 'status-pill'
  if (status === 'approaching') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function pickupLogClass(event: TransportPickupLogRecord['event']) {
  if (event === 'unauthorized_attempt') return 'alert-item alert-item--warning'
  if (event === 'dropoff') return 'alert-item alert-item--info'
  return 'alert-item alert-item--calm'
}

function notificationClass(type: ParentTransportView['liveTracking']['notifications'][number]['type']) {
  if (type === 'geofence') return 'alert-item alert-item--warning'
  if (type === 'route_change') return 'alert-item alert-item--info'
  return 'alert-item alert-item--calm'
}

function firstUpcomingStop(stops: TransportRouteStopRecord[]) {
  return stops.find((item) => item.status !== 'served') ?? stops[stops.length - 1] ?? null
}

function toIsoOrNull(localValue: string) {
  if (!localValue) return null
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

async function refreshTransportFeed(childId: string | null) {
  if (!childId) {
    liveTrackingState.value = null
    routeInfoState.value = null
    pickupState.value = null
    requestItemsState.value = []
    return
  }

  transportFeedLoading.value = true
  transportFeedError.value = ''
  try {
    const [livePayload, pickupPayload, requestsPayload] = await Promise.all([
      $fetch<{
        routeName: string
        mapUrl: string | null
        latestPoint: ParentTransportView['liveTracking']['latestPoint']
        routeHistory: ParentTransportView['liveTracking']['routeHistory']
        notifications: ParentTransportView['liveTracking']['notifications']
        geofenceAlerts: ParentTransportView['liveTracking']['geofenceAlerts']
        stops: ParentTransportView['routeInfo']['stops']
        routeUpdates: string[]
        alternativeRoute: string | null
        driver: ParentTransportView['routeInfo']['driver']
      }>('/api/parent/transport/live', { query: { child: childId } }),
      $fetch<{ parentQrCode: string | null; persons: TransportPickupPersonRecord[]; log: TransportPickupLogRecord[] }>('/api/parent/transport/pickup', { query: { child: childId } }),
      $fetch<{ items: TransportRequestRecord[] }>('/api/parent/transport/requests', { query: { child: childId } })
    ])

    liveTrackingState.value = {
      routeName: livePayload.routeName,
      mapUrl: livePayload.mapUrl,
      latestPoint: livePayload.latestPoint,
      routeHistory: livePayload.routeHistory,
      notifications: livePayload.notifications,
      geofenceAlerts: livePayload.geofenceAlerts
    }
    routeInfoState.value = {
      driver: livePayload.driver,
      stops: livePayload.stops,
      routeUpdates: livePayload.routeUpdates,
      alternativeRoute: livePayload.alternativeRoute
    }
    pickupState.value = {
      parentQrCode: pickupPayload.parentQrCode,
      persons: pickupPayload.persons,
      log: pickupPayload.log
    }
    requestItemsState.value = requestsPayload.items
  } catch {
    transportFeedError.value = 'Live transport feed could not be refreshed. Showing seeded records.'
    liveTrackingState.value = null
    routeInfoState.value = null
    pickupState.value = null
    requestItemsState.value = []
  } finally {
    transportFeedLoading.value = false
  }
}

async function submitTransportRequest() {
  const childId = props.viewModel.activeChildId
  const detail = requestDetail.value.trim()

  if (!childId) {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'No linked child selected.'
    return
  }
  if (!detail) {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'Add request details before submitting.'
    return
  }

  requestLoading.value = true
  requestFeedback.value = ''
  try {
    const payload = await $fetch<{
      message: string
      items: TransportRequestRecord[]
    }>('/api/parent/transport/requests', {
      method: 'POST',
      body: {
        childId,
        type: requestType.value,
        detail
      }
    })

    requestItemsState.value = payload.items
    requestFeedbackTone.value = 'success'
    requestFeedback.value = payload.message
    requestDetail.value = ''
  } catch {
    requestFeedbackTone.value = 'error'
    requestFeedback.value = 'Transport request could not be submitted right now.'
  } finally {
    requestLoading.value = false
  }
}

async function addPickupPerson() {
  const childId = props.viewModel.activeChildId
  if (!childId) {
    pickupFeedbackTone.value = 'error'
    pickupFeedback.value = 'No linked child selected.'
    return
  }

  pickupLoading.value = true
  pickupFeedback.value = ''
  try {
    const payload = await $fetch<{
      message: string
      persons: TransportPickupPersonRecord[]
      log: TransportPickupLogRecord[]
    }>('/api/parent/transport/pickup', {
      method: 'POST',
      body: {
        action: 'add_person',
        childId,
        fullName: fullName.value,
        relationship: relationship.value,
        temporary: temporary.value,
        expiresAt: toIsoOrNull(expiresAtLocal.value),
        photoIdLabel: photoIdLabel.value
      }
    })

    pickupState.value = {
      parentQrCode: pickup.value.parentQrCode,
      persons: payload.persons,
      log: payload.log
    }
    pickupFeedbackTone.value = 'success'
    pickupFeedback.value = payload.message
    fullName.value = ''
    relationship.value = ''
    temporary.value = false
    expiresAtLocal.value = ''
    photoIdLabel.value = ''
  } catch {
    pickupFeedbackTone.value = 'error'
    pickupFeedback.value = 'Authorized pickup person could not be added.'
  } finally {
    pickupLoading.value = false
  }
}

async function scanPickup() {
  const childId = props.viewModel.activeChildId
  if (!childId) {
    pickupFeedbackTone.value = 'error'
    pickupFeedback.value = 'No linked child selected.'
    return
  }

  if (!scanQrCode.value.trim()) {
    pickupFeedbackTone.value = 'error'
    pickupFeedback.value = 'Enter or select a QR code to scan.'
    return
  }

  pickupLoading.value = true
  pickupFeedback.value = ''
  try {
    const payload = await $fetch<{
      authorized: boolean
      message: string
      persons: TransportPickupPersonRecord[]
      log: TransportPickupLogRecord[]
    }>('/api/parent/transport/pickup', {
      method: 'POST',
      body: {
        action: 'scan',
        childId,
        qrCode: scanQrCode.value,
        event: scanEvent.value,
        actorName: scanActorName.value.trim() || null
      }
    })

    pickupState.value = {
      parentQrCode: pickup.value.parentQrCode,
      persons: payload.persons,
      log: payload.log
    }
    pickupFeedbackTone.value = payload.authorized ? 'success' : 'error'
    pickupFeedback.value = payload.message
    if (payload.authorized) {
      scanActorName.value = ''
    }
  } catch {
    pickupFeedbackTone.value = 'error'
    pickupFeedback.value = 'QR validation failed. Please retry.'
  } finally {
    pickupLoading.value = false
  }
}
</script>

<template>
  <div>
    <motion.section
      class="dashboard-hero-card"
      :initial="{ opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35 }"
    >
      <template v-if="props.viewModel.activeChild">
        <div class="dashboard-hero-card__media">
          <div class="student-avatar">{{ props.viewModel.activeChildInitials }}</div>
        </div>
        <div class="dashboard-hero-card__content">
          <p class="eyebrow">Transport module</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} - {{ props.viewModel.activeChild.gradeLabel }} - {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ liveTracking.routeName }}</span>
            <span>{{ liveTracking.latestPoint ? `${liveTracking.latestPoint.etaMinutes} min ETA` : 'GPS pending' }}</span>
            <span>{{ requestItems.length }} request(s)</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ routeInfo.alternativeRoute ?? 'Alternative route will appear when configured.' }}</p>
        </div>
        <div class="dashboard-hero-card__switcher">
          <p class="eyebrow">Switch child</p>
          <div class="child-switcher">
            <button
              v-for="child in props.viewModel.childTabs"
              :key="child.id"
              class="child-switcher__button"
              :class="{ 'child-switcher__button--active': child.isActive }"
              type="button"
              @click="emit('selectChild', child.id)"
            >
              <span class="child-switcher__avatar">{{ child.initials }}</span>
              <span>
                <strong>{{ child.fullName }}</strong>
                <small>{{ child.gradeLabel }} - {{ child.schoolName }}</small>
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="hero-summary hero-summary--single">
          <article class="hero-summary__card">
            <p class="eyebrow">Transport module</p>
            <h3>No transport profile linked yet</h3>
            <p>Once a child profile is linked, live bus tracking, secure pickup, and transport requests will appear here.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Transport pulse</h2>
        <p>Real-time location, route operations, pickup safety, and parent requests in one timeline.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="transportFeedError" class="form-message form-message--error">{{ transportFeedError }}</p>
      <p v-else-if="transportFeedLoading" class="module-note">Refreshing live transport feed...</p>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">7.1 Real-time GPS tracking</p>
          <h2>Live location, ETA, route history, speed, geofence alerts</h2>
          <p>Parents get real-time location and ETA with immediate notifications when route behavior changes.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>Latest speed: {{ liveTracking.latestPoint ? `${liveTracking.latestPoint.speedKmh} km/h` : 'N/A' }}</span>
          <span>ETA: {{ liveTracking.latestPoint ? `${liveTracking.latestPoint.etaMinutes} minutes` : 'N/A' }}</span>
          <span>{{ liveTracking.latestPoint?.onRoute ? 'On route' : 'Out-of-route flag' }}</span>
        </div>
        <div class="pill-row" style="margin-top: 12px;">
          <a v-if="liveTracking.mapUrl" class="asset-pill" :href="liveTracking.mapUrl" target="_blank" rel="noreferrer">Open live bus map</a>
          <span class="asset-pill">Coords: {{ liveTracking.latestPoint ? `${liveTracking.latestPoint.position.lat.toFixed(5)}, ${liveTracking.latestPoint.position.lng.toFixed(5)}` : 'Unavailable' }}</span>
        </div>
        <div class="stack" style="margin-top: 16px;">
          <article v-for="item in liveTracking.notifications" :key="item.id" :class="notificationClass(item.type)">
            <div class="alert-item__icon">{{ item.type === 'bus_5_min' ? 'i' : item.type === 'geofence' ? '!' : 'o' }}</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ formatTimestamp(item.createdAt) }}</small>
            </div>
          </article>
        </div>
        <div class="stack stack--compact" style="margin-top: 16px;" v-if="liveTracking.geofenceAlerts.length">
          <article v-for="item in liveTracking.geofenceAlerts" :key="item.id" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>Geofence alert - {{ item.severity }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ formatTimestamp(item.createdAt) }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Route history</p>
          <h2>Recent movement records</h2>
          <p>Each GPS point captures timestamp, speed, and route alignment.</p>
        </div>
        <div class="stack">
          <article v-for="point in liveTracking.routeHistory.slice(0, 8)" :key="point.id" class="list-card">
            <div class="list-card__header">
              <h3>{{ formatTimestamp(point.recordedAt) }}</h3>
              <span :class="point.onRoute ? 'status-pill' : 'status-pill status-pill--alert'">{{ point.onRoute ? 'On route' : 'Deviation' }}</span>
            </div>
            <p>{{ point.position.lat.toFixed(5) }}, {{ point.position.lng.toFixed(5) }}</p>
            <small>{{ point.speedKmh }} km/h - ETA {{ point.etaMinutes }} min</small>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">7.2 Route information</p>
        <h2>Driver profile, stops, schedule, and route changes</h2>
        <p>Parents can review bus, driver, all planned stops, and alternative route details.</p>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Driver and vehicle</p>
            <h3>{{ routeInfo.driver?.busNumber ?? 'Bus pending' }}</h3>
          </div>
          <div class="summary-strip summary-strip--muted">
            <span>{{ routeInfo.driver?.fullName ?? 'No driver assigned' }}</span>
            <span>{{ routeInfo.driver?.phone ?? 'No phone available' }}</span>
          </div>
          <img
            v-if="routeInfo.driver?.photoUrl"
            :src="routeInfo.driver.photoUrl"
            :alt="routeInfo.driver.fullName"
            style="width: 120px; height: 120px; border-radius: 14px; object-fit: cover; margin-top: 12px;"
          />
          <p class="module-note" style="margin-top: 12px;">License {{ routeInfo.driver?.licenseNumber ?? 'N/A' }} - Valid until {{ routeInfo.driver?.licenseValidUntil ?? 'N/A' }}</p>
          <div class="stack stack--compact" style="margin-top: 16px;">
            <article v-for="item in routeInfo.routeUpdates" :key="item" class="alert-item alert-item--info">
              <div class="alert-item__icon">i</div>
              <div><p>{{ item }}</p></div>
            </article>
          </div>
          <p class="module-note">{{ routeInfo.alternativeRoute ?? 'Alternative route details are not configured yet.' }}</p>
        </article>

        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Stops and schedule</p>
            <h3>{{ firstUpcomingStop(routeInfo.stops)?.label ?? 'No stops assigned' }}</h3>
          </div>
          <div class="stack">
            <article v-for="stop in routeInfo.stops" :key="stop.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ stop.label }}</h3>
                  <p>Scheduled {{ formatTimestamp(stop.scheduledAt) }}</p>
                </div>
                <span :class="stopStatusClass(stop.status)">{{ stop.status }}</span>
              </div>
              <small>ETA {{ formatTimestamp(stop.etaAt) }}</small>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">7.3 Secure pickup system</p>
        <h2>Parent QR, authorized alternatives, full pickup logs</h2>
        <p>Driver QR scans are recorded for every pickup/drop-off, with alerts on unauthorized attempts.</p>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Parent QR</p>
            <h3>{{ pickup.parentQrCode ?? 'No QR configured' }}</h3>
          </div>
          <div class="pill-row">
            <span class="asset-pill">Parent code: {{ pickup.parentQrCode ?? 'Unavailable' }}</span>
          </div>

          <div class="section-copy section-copy--tight" style="margin-top: 18px;">
            <p class="eyebrow">Add authorized person</p>
            <h3>Temporary or permanent access</h3>
          </div>
          <label class="field-stack">
            <span>Full name</span>
            <input v-model="fullName" type="text" class="input-textarea input-textarea--single" placeholder="Example: Fatima Bennani" />
          </label>
          <label class="field-stack">
            <span>Relationship</span>
            <input v-model="relationship" type="text" class="input-textarea input-textarea--single" placeholder="Example: Grandmother" />
          </label>
          <label class="field-stack">
            <span>Photo ID verification</span>
            <input v-model="photoIdLabel" type="text" class="input-textarea input-textarea--single" placeholder="Example: CIN BK45902" />
          </label>
          <label class="checkbox-row">
            <input v-model="temporary" type="checkbox" />
            <span>Temporary QR (expires after date/time)</span>
          </label>
          <label v-if="temporary" class="field-stack">
            <span>Expiry date/time</span>
            <input v-model="expiresAtLocal" type="datetime-local" class="input-textarea input-textarea--single" />
          </label>
          <button class="button button--primary" type="button" :disabled="pickupLoading" @click="addPickupPerson">
            {{ pickupLoading ? 'Saving...' : 'Add authorized person' }}
          </button>

          <div class="section-copy section-copy--tight" style="margin-top: 18px;">
            <p class="eyebrow">Driver scan simulator</p>
            <h3>Validate pickup or drop-off</h3>
          </div>
          <label class="field-stack">
            <span>QR code</span>
            <select v-model="scanQrCode" class="input-select">
              <option :value="pickup.parentQrCode ?? ''">Parent QR ({{ pickup.parentQrCode ?? 'N/A' }})</option>
              <option v-for="person in pickup.persons" :key="person.id" :value="person.qrCode">{{ person.fullName }} - {{ person.qrCode }}</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Event</span>
            <select v-model="scanEvent" class="input-select">
              <option value="pickup">Pickup</option>
              <option value="dropoff">Drop-off</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Actor name (optional if QR unknown)</span>
            <input v-model="scanActorName" type="text" class="input-textarea input-textarea--single" placeholder="Example: Family friend" />
          </label>
          <button class="button button--secondary" type="button" :disabled="pickupLoading" @click="scanPickup">
            {{ pickupLoading ? 'Validating...' : 'Scan QR now' }}
          </button>

          <p v-if="pickupFeedback" class="form-message" :class="{ 'form-message--error': pickupFeedbackTone === 'error' }">{{ pickupFeedback }}</p>
        </article>

        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Authorized people</p>
            <h3>Alternative pickup list</h3>
          </div>
          <div class="stack">
            <article v-for="person in pickup.persons" :key="person.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ person.fullName }}</h3>
                  <p>{{ person.relationship }} - {{ person.photoIdLabel }}</p>
                </div>
                <span :class="person.temporary ? 'status-pill status-pill--warning' : 'status-pill'">{{ person.temporary ? 'Temporary' : 'Permanent' }}</span>
              </div>
              <small>{{ person.qrCode }}{{ person.expiresAt ? ` - expires ${formatDate(person.expiresAt)}` : '' }}</small>
            </article>
          </div>

          <div class="section-copy section-copy--tight" style="margin-top: 18px;">
            <p class="eyebrow">Pickup/drop-off log</p>
            <h3>Security events history</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in pickup.log" :key="item.id" :class="pickupLogClass(item.event)">
              <div class="alert-item__icon">{{ item.event === 'unauthorized_attempt' ? '!' : 'o' }}</div>
              <div>
                <h3>{{ item.actorName }} - {{ item.event }}</h3>
                <p>{{ item.note }}</p>
                <small>{{ formatTimestamp(item.happenedAt) }}</small>
              </div>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">7.4 Transport requests</p>
        <h2>Service requests, one-time skip, stop changes, issue reports</h2>
        <p>Submit transport requests directly from the app and track approval status updates.</p>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <label class="field-stack">
            <span>Request type</span>
            <select v-model="requestType" class="input-select">
              <option value="service_request">Request transport service</option>
              <option value="skip_once">One-time skip</option>
              <option value="change_stop">Change pickup/drop-off point</option>
              <option value="issue_report">Report issue</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Details</span>
            <textarea v-model="requestDetail" class="input-textarea" rows="4" placeholder="Add clear details for the transport office."></textarea>
          </label>
          <button class="button button--primary" type="button" :disabled="requestLoading" @click="submitTransportRequest">
            {{ requestLoading ? 'Submitting...' : 'Submit transport request' }}
          </button>
          <p v-if="requestFeedback" class="form-message" :class="{ 'form-message--error': requestFeedbackTone === 'error' }">{{ requestFeedback }}</p>
        </article>

        <article class="panel-card panel-card--inner">
          <div class="stack">
            <article v-for="item in requestItems" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ requestTypeLabel(item.type) }}</h3>
                  <p>{{ formatTimestamp(item.createdAt) }}</p>
                </div>
                <span :class="requestStatusClass(item.status)">{{ item.status }}</span>
              </div>
              <p>{{ item.detail }}</p>
              <small>Updated {{ formatTimestamp(item.updatedAt) }}</small>
            </article>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

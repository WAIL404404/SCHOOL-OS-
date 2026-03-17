import type {
  ChildTransportModuleRecord,
  TransportDriverRecord,
  TransportGeofenceAlertRecord,
  TransportLivePointRecord,
  TransportNotificationRecord,
  TransportPickupLogRecord,
  TransportPickupPersonRecord,
  TransportRequestRecord,
  TransportRouteStopRecord
} from './types.ts'

function point(payload: TransportLivePointRecord): TransportLivePointRecord {
  return payload
}

function note(payload: TransportNotificationRecord): TransportNotificationRecord {
  return payload
}

function stop(payload: TransportRouteStopRecord): TransportRouteStopRecord {
  return payload
}

function alert(payload: TransportGeofenceAlertRecord): TransportGeofenceAlertRecord {
  return payload
}

function person(payload: TransportPickupPersonRecord): TransportPickupPersonRecord {
  return payload
}

function log(payload: TransportPickupLogRecord): TransportPickupLogRecord {
  return payload
}

function request(payload: TransportRequestRecord): TransportRequestRecord {
  return payload
}

function driver(payload: TransportDriverRecord): TransportDriverRecord {
  return payload
}

const linaDriver = driver({
  fullName: 'Rachid El Alami',
  phone: '+212 661 223 410',
  busNumber: 'BUS-NORTH-04',
  photoUrl: 'https://placehold.co/180x180/png?text=Rachid',
  licenseNumber: 'MA-DRV-772910',
  licenseValidUntil: '2028-05-19'
})

const linaLivePoints: TransportLivePointRecord[] = [
  point({ id: 'lina-live-1', recordedAt: '2026-03-17T06:58:00+01:00', position: { lat: 34.01773, lng: -6.83631 }, speedKmh: 28, etaMinutes: 14, onRoute: true }),
  point({ id: 'lina-live-2', recordedAt: '2026-03-17T07:04:00+01:00', position: { lat: 34.02122, lng: -6.82837 }, speedKmh: 31, etaMinutes: 8, onRoute: true }),
  point({ id: 'lina-live-3', recordedAt: '2026-03-17T07:09:00+01:00', position: { lat: 34.02411, lng: -6.82205 }, speedKmh: 24, etaMinutes: 5, onRoute: true })
]

const linaRouteHistory: TransportLivePointRecord[] = [
  point({ id: 'lina-history-1', recordedAt: '2026-03-16T06:55:00+01:00', position: { lat: 34.01371, lng: -6.84011 }, speedKmh: 26, etaMinutes: 16, onRoute: true }),
  point({ id: 'lina-history-2', recordedAt: '2026-03-16T07:01:00+01:00', position: { lat: 34.01856, lng: -6.83204 }, speedKmh: 30, etaMinutes: 9, onRoute: true }),
  point({ id: 'lina-history-3', recordedAt: '2026-03-16T07:08:00+01:00', position: { lat: 34.02302, lng: -6.82427 }, speedKmh: 22, etaMinutes: 4, onRoute: true }),
  ...linaLivePoints
]

const yanisDriver = driver({
  fullName: 'Rachid El Alami',
  phone: '+212 661 223 410',
  busNumber: 'BUS-NORTH-04',
  photoUrl: 'https://placehold.co/180x180/png?text=Rachid',
  licenseNumber: 'MA-DRV-772910',
  licenseValidUntil: '2028-05-19'
})

const salmaDriver = driver({
  fullName: 'Nadia Berrada',
  phone: '+212 661 552 804',
  busNumber: 'BUS-CENTER-02',
  photoUrl: 'https://placehold.co/180x180/png?text=Nadia',
  licenseNumber: 'MA-DRV-401886',
  licenseValidUntil: '2027-11-03'
})

const pendingDriver = driver({
  fullName: 'Pending assignment',
  phone: 'Not assigned',
  busNumber: 'Pending',
  photoUrl: 'https://placehold.co/180x180/png?text=Pending',
  licenseNumber: 'Pending',
  licenseValidUntil: 'Pending'
})

export const childTransportById: Record<string, ChildTransportModuleRecord> = {
  'student-lina': {
    routeName: 'North Route A',
    alternativeRoute: 'Avenue Annakhil diversion when Avenue Mohammed VI is congested.',
    livePoints: linaLivePoints,
    routeHistory: linaRouteHistory,
    notifications: [
      note({ id: 'lina-note-1', type: 'boarded', title: 'Your child boarded the bus', detail: 'Lina boarded at Stop 3 at 07:01.', createdAt: '2026-03-17T07:01:00+01:00' }),
      note({ id: 'lina-note-2', type: 'bus_5_min', title: 'Bus is 5 min away', detail: 'Bus-NORTH-04 is now 5 minutes from your pickup point.', createdAt: '2026-03-17T07:09:00+01:00' }),
      note({ id: 'lina-note-3', type: 'exited', title: 'Your child exited the bus', detail: 'Yesterday, Lina exited at Summit Gate at 07:26.', createdAt: '2026-03-16T07:26:00+01:00' })
    ],
    stops: [
      stop({ id: 'lina-stop-1', label: 'Hay Riad - Gate 5', scheduledAt: '2026-03-17T06:55:00+01:00', etaAt: '2026-03-17T06:57:00+01:00', status: 'served' }),
      stop({ id: 'lina-stop-2', label: 'Annakhil Roundabout', scheduledAt: '2026-03-17T07:03:00+01:00', etaAt: '2026-03-17T07:05:00+01:00', status: 'served' }),
      stop({ id: 'lina-stop-3', label: 'Bennani Residence Stop', scheduledAt: '2026-03-17T07:12:00+01:00', etaAt: '2026-03-17T07:14:00+01:00', status: 'approaching' }),
      stop({ id: 'lina-stop-4', label: 'Summit Main Gate', scheduledAt: '2026-03-17T07:25:00+01:00', etaAt: '2026-03-17T07:28:00+01:00', status: 'upcoming' })
    ],
    routeUpdates: [
      'Traffic detected near Avenue Mohammed VI. Route switched to Annakhil diversion with +3 minutes ETA.',
      'Morning departure confirmed on schedule by transport supervisor.'
    ],
    driver: linaDriver,
    geofenceAlerts: [
      alert({ id: 'lina-geo-1', createdAt: '2026-03-14T07:11:00+01:00', detail: 'Bus left expected corridor for 2 minutes due to road closure.', severity: 'warning' })
    ],
    parentQrCode: 'PARENT-LINA-QR-7F2A91',
    pickupPersons: [
      person({ id: 'pickup-lina-1', fullName: 'Khadija Bennani', relationship: 'Grandmother', temporary: false, expiresAt: null, qrCode: 'ALT-LINA-KHADIJA-5541', photoIdLabel: 'CIN BK45902' }),
      person({ id: 'pickup-lina-2', fullName: 'Youssef Bennani', relationship: 'Uncle', temporary: true, expiresAt: '2026-03-20T18:00:00+01:00', qrCode: 'ALT-LINA-YOUSSEF-8803', photoIdLabel: 'Passport M771222' })
    ],
    pickupLog: [
      log({ id: 'pickup-log-lina-1', event: 'dropoff', actorName: 'Amira Bennani', authorized: true, happenedAt: '2026-03-16T07:27:00+01:00', note: 'Parent QR scanned at school gate.' }),
      log({ id: 'pickup-log-lina-2', event: 'pickup', actorName: 'Khadija Bennani', authorized: true, happenedAt: '2026-03-16T16:34:00+01:00', note: 'Authorized alternative pickup accepted with QR + photo ID.' }),
      log({ id: 'pickup-log-lina-3', event: 'unauthorized_attempt', actorName: 'Unknown adult', authorized: false, happenedAt: '2026-03-11T16:31:00+01:00', note: 'QR mismatch. Supervisor notified immediately.' })
    ],
    requests: [
      request({ id: 'transport-req-lina-1', type: 'change_stop', status: 'reviewing', detail: 'Move Tuesday pickup to Annakhil Roundabout for 3 weeks.', createdAt: '2026-03-12T09:45:00+01:00', updatedAt: '2026-03-13T10:20:00+01:00' }),
      request({ id: 'transport-req-lina-2', type: 'skip_once', status: 'approved', detail: 'Skip morning bus on 2026-03-19 due to medical visit.', createdAt: '2026-03-15T18:04:00+01:00', updatedAt: '2026-03-15T18:22:00+01:00' })
    ]
  },
  'student-yanis': {
    routeName: 'North Route A',
    alternativeRoute: 'Avenue Annakhil diversion when Avenue Mohammed VI is congested.',
    livePoints: [
      point({ id: 'yanis-live-1', recordedAt: '2026-03-17T07:02:00+01:00', position: { lat: 34.01964, lng: -6.83055 }, speedKmh: 29, etaMinutes: 7, onRoute: true }),
      point({ id: 'yanis-live-2', recordedAt: '2026-03-17T07:08:00+01:00', position: { lat: 34.02211, lng: -6.82412 }, speedKmh: 25, etaMinutes: 3, onRoute: true })
    ],
    routeHistory: [
      point({ id: 'yanis-history-1', recordedAt: '2026-03-16T07:03:00+01:00', position: { lat: 34.01892, lng: -6.83174 }, speedKmh: 27, etaMinutes: 8, onRoute: true }),
      point({ id: 'yanis-history-2', recordedAt: '2026-03-16T07:09:00+01:00', position: { lat: 34.02241, lng: -6.82455 }, speedKmh: 24, etaMinutes: 3, onRoute: true })
    ],
    notifications: [
      note({ id: 'yanis-note-1', type: 'boarded', title: 'Your child boarded the bus', detail: 'Yanis boarded at 07:04.', createdAt: '2026-03-17T07:04:00+01:00' }),
      note({ id: 'yanis-note-2', type: 'bus_5_min', title: 'Bus is 5 min away', detail: 'The bus is approaching your stop now.', createdAt: '2026-03-17T07:06:00+01:00' })
    ],
    stops: [
      stop({ id: 'yanis-stop-1', label: 'El Mansour Stop', scheduledAt: '2026-03-17T07:00:00+01:00', etaAt: '2026-03-17T07:02:00+01:00', status: 'served' }),
      stop({ id: 'yanis-stop-2', label: 'Yanis Residence Stop', scheduledAt: '2026-03-17T07:10:00+01:00', etaAt: '2026-03-17T07:11:00+01:00', status: 'approaching' }),
      stop({ id: 'yanis-stop-3', label: 'Summit Early Years Gate', scheduledAt: '2026-03-17T07:22:00+01:00', etaAt: '2026-03-17T07:24:00+01:00', status: 'upcoming' })
    ],
    routeUpdates: ['Route running on schedule for all north stops.'],
    driver: yanisDriver,
    geofenceAlerts: [],
    parentQrCode: 'PARENT-YANIS-QR-9H2L11',
    pickupPersons: [
      person({ id: 'pickup-yanis-1', fullName: 'Nora Alaoui', relationship: 'Aunt', temporary: false, expiresAt: null, qrCode: 'ALT-YANIS-NORA-1190', photoIdLabel: 'CIN BL22014' })
    ],
    pickupLog: [
      log({ id: 'pickup-log-yanis-1', event: 'dropoff', actorName: 'Samir El Mansouri', authorized: true, happenedAt: '2026-03-16T07:24:00+01:00', note: 'Parent QR validated.' })
    ],
    requests: [
      request({ id: 'transport-req-yanis-1', type: 'service_request', status: 'approved', detail: 'Enable afternoon return transport on Monday and Wednesday.', createdAt: '2026-03-10T08:33:00+01:00', updatedAt: '2026-03-11T11:40:00+01:00' })
    ]
  },
  'student-adam': {
    routeName: 'Atlas Route Pending',
    alternativeRoute: 'Assignment in progress after address confirmation.',
    livePoints: [],
    routeHistory: [],
    notifications: [
      note({ id: 'adam-note-1', type: 'route_change', title: 'Transport route assignment pending', detail: 'Atlas campus will assign Adam to a route within 48 hours.', createdAt: '2026-03-16T15:00:00+01:00' })
    ],
    stops: [],
    routeUpdates: ['Family address verification in progress before final route assignment.'],
    driver: pendingDriver,
    geofenceAlerts: [],
    parentQrCode: 'PARENT-ADAM-QR-4K1Q20',
    pickupPersons: [],
    pickupLog: [],
    requests: [
      request({ id: 'transport-req-adam-1', type: 'service_request', status: 'submitted', detail: 'Request full transport coverage (morning and afternoon).', createdAt: '2026-03-16T14:45:00+01:00', updatedAt: '2026-03-16T14:45:00+01:00' })
    ]
  },
  'student-salma': {
    routeName: 'Center Route C',
    alternativeRoute: 'Route can switch to Agdal loop when city center traffic is blocked.',
    livePoints: [
      point({ id: 'salma-live-1', recordedAt: '2026-03-17T07:06:00+01:00', position: { lat: 34.00661, lng: -6.85123 }, speedKmh: 33, etaMinutes: 11, onRoute: true }),
      point({ id: 'salma-live-2', recordedAt: '2026-03-17T07:12:00+01:00', position: { lat: 34.01094, lng: -6.84336 }, speedKmh: 34, etaMinutes: 5, onRoute: true })
    ],
    routeHistory: [
      point({ id: 'salma-history-1', recordedAt: '2026-03-16T07:05:00+01:00', position: { lat: 34.00511, lng: -6.85315 }, speedKmh: 32, etaMinutes: 12, onRoute: true }),
      point({ id: 'salma-history-2', recordedAt: '2026-03-16T07:13:00+01:00', position: { lat: 34.01022, lng: -6.84417 }, speedKmh: 35, etaMinutes: 4, onRoute: true })
    ],
    notifications: [
      note({ id: 'salma-note-1', type: 'boarded', title: 'Your child boarded the bus', detail: 'Salma boarded at 07:07.', createdAt: '2026-03-17T07:07:00+01:00' }),
      note({ id: 'salma-note-2', type: 'bus_5_min', title: 'Bus is 5 min away', detail: 'Bus-CENTER-02 is now 5 minutes from school gate.', createdAt: '2026-03-17T07:12:00+01:00' })
    ],
    stops: [
      stop({ id: 'salma-stop-1', label: 'Agdal Avenue', scheduledAt: '2026-03-17T07:00:00+01:00', etaAt: '2026-03-17T07:02:00+01:00', status: 'served' }),
      stop({ id: 'salma-stop-2', label: 'El Mansouri Residence', scheduledAt: '2026-03-17T07:08:00+01:00', etaAt: '2026-03-17T07:09:00+01:00', status: 'served' }),
      stop({ id: 'salma-stop-3', label: 'Summit Main Gate', scheduledAt: '2026-03-17T07:20:00+01:00', etaAt: '2026-03-17T07:22:00+01:00', status: 'approaching' })
    ],
    routeUpdates: ['Center Route C delayed by 2 minutes due to temporary lane closure.'],
    driver: salmaDriver,
    geofenceAlerts: [
      alert({ id: 'salma-geo-1', createdAt: '2026-03-13T16:21:00+01:00', detail: 'Bus crossed geofence near Avenue Hassan II and returned in under 1 minute.', severity: 'warning' })
    ],
    parentQrCode: 'PARENT-SALMA-QR-2M7D63',
    pickupPersons: [
      person({ id: 'pickup-salma-1', fullName: 'Meryem El Mansouri', relationship: 'Sister', temporary: false, expiresAt: null, qrCode: 'ALT-SALMA-MERYEM-2203', photoIdLabel: 'CIN BQ44012' })
    ],
    pickupLog: [
      log({ id: 'pickup-log-salma-1', event: 'dropoff', actorName: 'Samir El Mansouri', authorized: true, happenedAt: '2026-03-16T07:21:00+01:00', note: 'Parent QR scan approved.' })
    ],
    requests: [
      request({ id: 'transport-req-salma-1', type: 'issue_report', status: 'completed', detail: 'Reported noise issue in back seats; supervisor addressed during afternoon route.', createdAt: '2026-03-09T17:15:00+01:00', updatedAt: '2026-03-10T08:30:00+01:00' })
    ]
  }
}

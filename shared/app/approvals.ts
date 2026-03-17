import type {
  ApprovalAttachmentRecord,
  ApprovalRequestRecord,
  ApprovalReminderRecord,
  ApprovalSignatureLogRecord,
  ChildApprovalsRecord
} from './types.ts'

function attachment(payload: ApprovalAttachmentRecord): ApprovalAttachmentRecord {
  return payload
}

function reminder(payload: ApprovalReminderRecord): ApprovalReminderRecord {
  return payload
}

function log(payload: ApprovalSignatureLogRecord): ApprovalSignatureLogRecord {
  return payload
}

function item(payload: ApprovalRequestRecord): ApprovalRequestRecord {
  return payload
}

function documentUrl(childId: string, approvalId: string) {
  const query = new URLSearchParams({ child: childId, approval: approvalId })
  return `/api/parent/approvals/document?${query.toString()}`
}

function guideAttachment(id: string, label: string, pathLabel: string): ApprovalAttachmentRecord {
  const content = `School OS approval attachment\\n${label}\\n${pathLabel}`
  return attachment({
    id,
    label,
    kind: 'pdf',
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
  })
}

const linaItems: ApprovalRequestRecord[] = [
  item({
    id: 'approval-lina-field-trip',
    childId: 'student-lina',
    type: 'field_trip',
    title: 'Rabat Science Museum field trip',
    summary: 'Permission needed for Grade 4 museum visit with supervised bus transport.',
    detail: 'The class will attend a science museum workshop on March 28 from 08:30 to 14:30. Lunch and transport are included. Parents must approve participation and emergency supervision.',
    requestedBy: 'Ms. Zohra - Grade 4 lead',
    requestedAt: '2026-03-16T09:10:00+01:00',
    updatedAt: '2026-03-16T09:10:00+01:00',
    eventDate: '2026-03-28T08:30:00+01:00',
    status: 'pending',
    attachments: [
      guideAttachment('attach-lina-trip-1', 'Field trip itinerary', 'Museum itinerary PDF'),
      guideAttachment('attach-lina-trip-2', 'Parent safety note', 'Safety and transport note')
    ],
    pdfUrl: documentUrl('student-lina', 'approval-lina-field-trip'),
    signatureRequired: true,
    signedAt: null,
    signerName: null,
    schoolConfirmation: 'Awaiting parent signature before seat is confirmed.',
    reminders: [
      reminder({ id: 'rem-lina-trip-24', approvalId: 'approval-lina-field-trip', triggerHoursAfter: 24, scheduledFor: '2026-03-17T09:10:00+01:00', status: 'scheduled' }),
      reminder({ id: 'rem-lina-trip-48', approvalId: 'approval-lina-field-trip', triggerHoursAfter: 48, scheduledFor: '2026-03-18T09:10:00+01:00', status: 'scheduled' }),
      reminder({ id: 'rem-lina-trip-72', approvalId: 'approval-lina-field-trip', triggerHoursAfter: 72, scheduledFor: '2026-03-19T09:10:00+01:00', status: 'scheduled' })
    ],
    canRevoke: false,
    revokeDeadline: null,
    revokePolicy: 'Field trip approvals cannot be revoked once transport manifests are locked 48 hours before departure.'
  }),
  item({
    id: 'approval-lina-photo-video',
    childId: 'student-lina',
    type: 'photo_video',
    title: 'Photography and video consent',
    summary: 'Annual media consent for school newsletter, website, and event recap clips.',
    detail: 'This consent covers school-managed photos and short event videos used in internal communications, the secure family portal, and approved promotional channels.',
    requestedBy: 'Communications office',
    requestedAt: '2026-02-02T10:00:00+01:00',
    updatedAt: '2026-02-02T18:22:00+01:00',
    eventDate: null,
    status: 'signed',
    attachments: [guideAttachment('attach-lina-media-1', 'Media usage policy', 'Communications consent terms')],
    pdfUrl: documentUrl('student-lina', 'approval-lina-photo-video'),
    signatureRequired: true,
    signedAt: '2026-02-02T18:22:00+01:00',
    signerName: 'Amira Bennani',
    schoolConfirmation: 'Signed consent archived and shared instantly with communications and student services.',
    reminders: [
      reminder({ id: 'rem-lina-media-24', approvalId: 'approval-lina-photo-video', triggerHoursAfter: 24, scheduledFor: '2026-02-03T10:00:00+01:00', status: 'sent' })
    ],
    canRevoke: true,
    revokeDeadline: '2026-06-30T18:00:00+01:00',
    revokePolicy: 'Consent can be revoked before the end of the school year. New media use stops immediately after revocation.'
  }),
  item({
    id: 'approval-lina-diet',
    childId: 'student-lina',
    type: 'special_diet',
    title: 'Special diet and allergy restrictions',
    summary: 'Nut-free meal handling and canteen allergy controls.',
    detail: 'The school confirms Lina must remain on a nut-free meal plan, with cafeteria staff and trip supervisors receiving the current allergy protocol.',
    requestedBy: 'School nurse',
    requestedAt: '2026-01-18T08:15:00+01:00',
    updatedAt: '2026-01-18T08:43:00+01:00',
    eventDate: null,
    status: 'signed',
    attachments: [guideAttachment('attach-lina-diet-1', 'Dietary protocol', 'Allergy handling instructions')],
    pdfUrl: documentUrl('student-lina', 'approval-lina-diet'),
    signatureRequired: true,
    signedAt: '2026-01-18T08:43:00+01:00',
    signerName: 'Amira Bennani',
    schoolConfirmation: 'Cafeteria and school health teams were notified instantly.',
    reminders: [],
    canRevoke: false,
    revokeDeadline: null,
    revokePolicy: 'Medical and food restriction records stay active until a new medical note replaces them.'
  })
]

const yanisItems: ApprovalRequestRecord[] = [
  item({
    id: 'approval-yanis-medical',
    childId: 'student-yanis',
    type: 'medical_treatment',
    title: 'Emergency medical treatment consent',
    summary: 'Consent for emergency stabilization and hospital transfer if needed.',
    detail: 'This authorization allows school staff to seek urgent medical care and notify the family immediately if emergency treatment is required during school hours or transport.',
    requestedBy: 'Student services office',
    requestedAt: '2026-01-12T09:00:00+01:00',
    updatedAt: '2026-01-12T09:24:00+01:00',
    eventDate: null,
    status: 'signed',
    attachments: [guideAttachment('attach-yanis-med-1', 'Emergency treatment policy', 'Medical response terms')],
    pdfUrl: documentUrl('student-yanis', 'approval-yanis-medical'),
    signatureRequired: true,
    signedAt: '2026-01-12T09:24:00+01:00',
    signerName: 'Amira Bennani',
    schoolConfirmation: 'Emergency response team has the signed authorization on file.',
    reminders: [],
    canRevoke: false,
    revokeDeadline: null,
    revokePolicy: 'Emergency treatment authorizations remain active for student safety and are replaced only by updated health file instructions.'
  }),
  item({
    id: 'approval-yanis-internet',
    childId: 'student-yanis',
    type: 'internet_policy',
    title: 'Internet usage policy for digital learning',
    summary: 'Approve supervised internet and app usage in class.',
    detail: 'Yanis will use school-managed tablets in teacher-supervised sessions. This policy covers age-appropriate websites, digital citizenship, and classroom app access.',
    requestedBy: 'Early years digital learning team',
    requestedAt: '2026-03-15T11:05:00+01:00',
    updatedAt: '2026-03-15T11:05:00+01:00',
    eventDate: null,
    status: 'pending',
    attachments: [guideAttachment('attach-yanis-web-1', 'Acceptable use policy', 'Digital learning guardrails')],
    pdfUrl: documentUrl('student-yanis', 'approval-yanis-internet'),
    signatureRequired: true,
    signedAt: null,
    signerName: null,
    schoolConfirmation: 'IT classroom access is pending approval.',
    reminders: [
      reminder({ id: 'rem-yanis-web-24', approvalId: 'approval-yanis-internet', triggerHoursAfter: 24, scheduledFor: '2026-03-16T11:05:00+01:00', status: 'scheduled' }),
      reminder({ id: 'rem-yanis-web-48', approvalId: 'approval-yanis-internet', triggerHoursAfter: 48, scheduledFor: '2026-03-17T11:05:00+01:00', status: 'scheduled' })
    ],
    canRevoke: true,
    revokeDeadline: '2026-06-30T18:00:00+01:00',
    revokePolicy: 'Internet consent can be revoked at any time. School-managed devices will then stay on offline-only activities.'
  })
]

const adamItems: ApprovalRequestRecord[] = [
  item({
    id: 'approval-adam-pickup',
    childId: 'student-adam',
    type: 'alternative_pickup',
    title: 'Alternative pickup person authorization',
    summary: 'Approve a campus pickup contact while Atlas route assignment is pending.',
    detail: 'Atlas campus requests an approved backup pickup contact for Adam during his first month on campus. The authorized person must present photo ID at dismissal.',
    requestedBy: 'Atlas campus reception',
    requestedAt: '2026-03-14T16:20:00+01:00',
    updatedAt: '2026-03-14T16:20:00+01:00',
    eventDate: null,
    status: 'pending',
    attachments: [guideAttachment('attach-adam-pickup-1', 'Dismissal safety rules', 'Authorized pickup requirements')],
    pdfUrl: documentUrl('student-adam', 'approval-adam-pickup'),
    signatureRequired: true,
    signedAt: null,
    signerName: null,
    schoolConfirmation: 'Reception desk is waiting for signed authorization.',
    reminders: [
      reminder({ id: 'rem-adam-pickup-24', approvalId: 'approval-adam-pickup', triggerHoursAfter: 24, scheduledFor: '2026-03-15T16:20:00+01:00', status: 'sent' }),
      reminder({ id: 'rem-adam-pickup-48', approvalId: 'approval-adam-pickup', triggerHoursAfter: 48, scheduledFor: '2026-03-16T16:20:00+01:00', status: 'scheduled' }),
      reminder({ id: 'rem-adam-pickup-72', approvalId: 'approval-adam-pickup', triggerHoursAfter: 72, scheduledFor: '2026-03-17T16:20:00+01:00', status: 'scheduled' })
    ],
    canRevoke: false,
    revokeDeadline: null,
    revokePolicy: 'Pickup authorizations can only be changed by submitting a fresh signed replacement.'
  }),
  item({
    id: 'approval-adam-data',
    childId: 'student-adam',
    type: 'data_sharing',
    title: 'Learning data sharing consent',
    summary: 'Allow limited academic data sharing between Summit and Atlas campuses during transition.',
    detail: 'This consent allows grade snapshots, support notes, and transition recommendations to be shared securely between the two campuses supporting Adam this term.',
    requestedBy: 'Atlas admissions and support team',
    requestedAt: '2026-03-13T14:40:00+01:00',
    updatedAt: '2026-03-13T15:05:00+01:00',
    eventDate: null,
    status: 'signed',
    attachments: [guideAttachment('attach-adam-data-1', 'Data-sharing scope', 'Records transfer summary')],
    pdfUrl: documentUrl('student-adam', 'approval-adam-data'),
    signatureRequired: true,
    signedAt: '2026-03-13T15:05:00+01:00',
    signerName: 'Amira Bennani',
    schoolConfirmation: 'Transition team received the signed consent instantly.',
    reminders: [],
    canRevoke: true,
    revokeDeadline: '2026-04-15T18:00:00+01:00',
    revokePolicy: 'Consent may be revoked while the transition support plan is active. Historic transfers already completed remain in the archive.'
  }),
  item({
    id: 'approval-adam-dismissal',
    childId: 'student-adam',
    type: 'early_dismissal',
    title: 'Early dismissal authorization for therapy appointment',
    summary: 'Authorize release at 14:00 on March 21.',
    detail: 'Atlas campus requests confirmation that Adam may leave campus early with his mother at 14:00 on March 21 for a scheduled therapy appointment.',
    requestedBy: 'Atlas front office',
    requestedAt: '2026-03-16T12:05:00+01:00',
    updatedAt: '2026-03-16T12:05:00+01:00',
    eventDate: '2026-03-21T14:00:00+01:00',
    status: 'pending',
    attachments: [guideAttachment('attach-adam-dismissal-1', 'Dismissal release note', 'Early release instructions')],
    pdfUrl: documentUrl('student-adam', 'approval-adam-dismissal'),
    signatureRequired: true,
    signedAt: null,
    signerName: null,
    schoolConfirmation: 'Front office will confirm release once the parent signs.',
    reminders: [
      reminder({ id: 'rem-adam-dismissal-24', approvalId: 'approval-adam-dismissal', triggerHoursAfter: 24, scheduledFor: '2026-03-17T12:05:00+01:00', status: 'scheduled' })
    ],
    canRevoke: false,
    revokeDeadline: null,
    revokePolicy: 'Single-event dismissals cannot be revoked after the office prepares the release list.'
  })
]

const salmaItems: ApprovalRequestRecord[] = [
  item({
    id: 'approval-salma-competition',
    childId: 'student-salma',
    type: 'competition_event',
    title: 'Debate finals participation consent',
    summary: 'Approve district debate finals participation and event transport.',
    detail: 'Salma has qualified for the district debate finals on April 3. This approval covers event participation, supervised travel, and photography during the award ceremony.',
    requestedBy: 'Debate coordinator',
    requestedAt: '2026-03-09T10:25:00+01:00',
    updatedAt: '2026-03-09T19:10:00+01:00',
    eventDate: '2026-04-03T08:00:00+01:00',
    status: 'signed',
    attachments: [
      guideAttachment('attach-salma-debate-1', 'Event schedule', 'Competition agenda'),
      guideAttachment('attach-salma-debate-2', 'Code of conduct', 'Participation rules')
    ],
    pdfUrl: documentUrl('student-salma', 'approval-salma-competition'),
    signatureRequired: true,
    signedAt: '2026-03-09T19:10:00+01:00',
    signerName: 'Samir El Mansouri',
    schoolConfirmation: 'Debate team roster updated immediately after signature.',
    reminders: [
      reminder({ id: 'rem-salma-debate-24', approvalId: 'approval-salma-competition', triggerHoursAfter: 24, scheduledFor: '2026-03-10T10:25:00+01:00', status: 'sent' })
    ],
    canRevoke: true,
    revokeDeadline: '2026-03-31T18:00:00+01:00',
    revokePolicy: 'Competition approval can be revoked before coach travel bookings close.'
  }),
  item({
    id: 'approval-salma-after-school',
    childId: 'student-salma',
    type: 'after_school_enrollment',
    title: 'After-school debate intensive enrollment',
    summary: 'Approve spring after-school intensive attendance.',
    detail: 'This approval confirms Salma may join the spring debate intensive every Wednesday from 16:00 to 17:30 through May 30.',
    requestedBy: 'After-school office',
    requestedAt: '2026-03-10T09:50:00+01:00',
    updatedAt: '2026-03-10T10:16:00+01:00',
    eventDate: '2026-03-18T16:00:00+01:00',
    status: 'signed',
    attachments: [guideAttachment('attach-salma-as-1', 'Enrollment summary', 'After-school participation note')],
    pdfUrl: documentUrl('student-salma', 'approval-salma-after-school'),
    signatureRequired: true,
    signedAt: '2026-03-10T10:16:00+01:00',
    signerName: 'Samir El Mansouri',
    schoolConfirmation: 'After-school office received instant confirmation and archived the approval PDF.',
    reminders: [],
    canRevoke: true,
    revokeDeadline: '2026-03-25T18:00:00+01:00',
    revokePolicy: 'After-school consent may be revoked before the second attended session.'
  })
]

export const childApprovalsById: Record<string, ChildApprovalsRecord> = {
  'student-lina': {
    items: linaItems,
    signatureLog: [
      log({ id: 'log-lina-media-sign', approvalId: 'approval-lina-photo-video', action: 'signed', actorName: 'Amira Bennani', actedAt: '2026-02-02T18:22:00+01:00', ipAddress: '105.71.122.16', deviceInfo: 'iPhone 15 · Safari' }),
      log({ id: 'log-lina-diet-sign', approvalId: 'approval-lina-diet', action: 'signed', actorName: 'Amira Bennani', actedAt: '2026-01-18T08:43:00+01:00', ipAddress: '105.71.122.16', deviceInfo: 'iPhone 15 · Safari' })
    ],
    flowNote: 'Each approval request records full details, device trace, timestamp, generated PDF, and instant school confirmation once signed.',
    archiveNote: 'Archived approvals remain downloadable throughout the school year. Revocation is only available when the request policy explicitly allows it.'
  },
  'student-yanis': {
    items: yanisItems,
    signatureLog: [
      log({ id: 'log-yanis-med-sign', approvalId: 'approval-yanis-medical', action: 'signed', actorName: 'Amira Bennani', actedAt: '2026-01-12T09:24:00+01:00', ipAddress: '105.71.122.16', deviceInfo: 'iPad Air · Safari' })
    ],
    flowNote: 'Unsigned approvals trigger reminder cadence after 24h, 48h, and 72h until the school closes or the parent signs.',
    archiveNote: 'Parents can filter approvals by type, date, and status, then download the archived PDF at any time.'
  },
  'student-adam': {
    items: adamItems,
    signatureLog: [
      log({ id: 'log-adam-data-sign', approvalId: 'approval-adam-data', action: 'signed', actorName: 'Amira Bennani', actedAt: '2026-03-13T15:05:00+01:00', ipAddress: '105.71.118.22', deviceInfo: 'iPad Air · Safari' })
    ],
    flowNote: 'Approval signatures sync to the school instantly so operational teams can prepare pickup, transition, and dismissal lists without manual follow-up.',
    archiveNote: 'Revocations are logged with the same legal traceability as signatures, including device and IP details.'
  },
  'student-salma': {
    items: salmaItems,
    signatureLog: [
      log({ id: 'log-salma-competition-sign', approvalId: 'approval-salma-competition', action: 'signed', actorName: 'Samir El Mansouri', actedAt: '2026-03-09T19:10:00+01:00', ipAddress: '196.200.91.12', deviceInfo: 'Galaxy S24 · Chrome' }),
      log({ id: 'log-salma-after-school-sign', approvalId: 'approval-salma-after-school', action: 'signed', actorName: 'Samir El Mansouri', actedAt: '2026-03-10T10:16:00+01:00', ipAddress: '196.200.91.12', deviceInfo: 'Galaxy S24 · Chrome' })
    ],
    flowNote: 'Signed approvals are archived automatically and the school receives an immediate confirmation notice for event and activity rosters.',
    archiveNote: 'Historical approvals remain grouped in one place with quick filtering and PDF retrieval.'
  }
}

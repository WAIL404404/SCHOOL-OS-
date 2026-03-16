import type {
  ChildContractsRecord,
  ContractCurrentRecord,
  ContractHistoryRecord,
  ContractReEnrollmentRecord,
  ContractSignerRecord,
  ContractSignatureLogRecord,
  ContractYearComparisonRecord
} from './types.ts'

function documentUrl(childId: string, type: 'current' | 'history' | 'amendment' | 'reenrollment', ref: string) {
  const query = new URLSearchParams({ child: childId, type, ref })
  return `/api/parent/contracts/document?${query.toString()}`
}

function current(payload: ContractCurrentRecord): ContractCurrentRecord {
  return payload
}

function signer(payload: ContractSignerRecord): ContractSignerRecord {
  return payload
}

function signature(payload: ContractSignatureLogRecord): ContractSignatureLogRecord {
  return payload
}

function reenrollment(payload: ContractReEnrollmentRecord): ContractReEnrollmentRecord {
  return payload
}

function historyItem(payload: ContractHistoryRecord): ContractHistoryRecord {
  return payload
}

function comparison(payload: ContractYearComparisonRecord): ContractYearComparisonRecord {
  return payload
}

const commonTerms = [
  { id: 'term-academic', title: 'Academic delivery', detail: 'The school provides the full accredited curriculum, classroom instruction, and periodic assessments for the enrolled grade.' },
  { id: 'term-conduct', title: 'Conduct and discipline', detail: 'Families commit to school conduct policies and timely responses to behavior or safety notices.' },
  { id: 'term-payment', title: 'Payment and obligations', detail: 'Fees are payable according to the selected plan. Delays may affect renewal and optional services.' },
  { id: 'term-privacy', title: 'Data and privacy', detail: 'Student records are processed according to school policy and applicable Moroccan data protection rules.' }
]

const buildCoverage = (transportIncluded: boolean) => [
  { id: 'coverage-core', label: 'Core academic program', included: true, detail: 'Daily teaching, assessments, and classroom learning materials.' },
  { id: 'coverage-support', label: 'Pastoral and student support', included: true, detail: 'Counseling checkpoints, safety supervision, and parent communications.' },
  { id: 'coverage-meal', label: 'Meal plan', included: false, detail: 'Optional cantine package billed separately when activated.' },
  { id: 'coverage-transport', label: 'Transport services', included: transportIncluded, detail: transportIncluded ? 'Covered under the selected enrollment package.' : 'Optional route service billed separately when requested.' }
]

export const childContractsById: Record<string, ChildContractsRecord> = {
  'student-lina': {
    current: current({
      id: 'contract-lina-2025-2026',
      contractRef: 'CNT-LINA-2025-2026',
      title: 'Enrollment Contract 2025-2026',
      startsAt: '2025-09-01T00:00:00+01:00',
      endsAt: '2026-06-30T23:59:59+01:00',
      renewalDate: '2026-05-20T23:59:59+01:00',
      status: 'active',
      fullContractUrl: documentUrl('student-lina', 'current', 'CNT-LINA-2025-2026'),
      terms: commonTerms,
      coverage: buildCoverage(false),
      cancellationPolicy: 'Cancellation requires 30-day notice in writing. Outstanding fees and approved service usage remain payable.',
      legalNote: 'Digital signatures follow Moroccan law 53-05 on electronic exchange and legal validity of e-signatures.'
    }),
    signers: [signer({ roleId: 'parent_1', label: 'Parent 1', fullName: 'Amira Bennani' }), signer({ roleId: 'parent_2', label: 'Parent 2', fullName: 'Karim Bennani' })],
    signatureLog: [
      signature({
        id: 'sig-lina-p1-2025',
        contractId: 'contract-lina-2025-2026',
        roleId: 'parent_1',
        signedBy: 'Amira Bennani',
        signedAt: '2025-08-17T19:02:00+01:00',
        ipAddress: '41.137.22.18'
      })
    ],
    reEnrollment: reenrollment({
      id: 're-lina-2026-2027',
      yearLabel: '2026-2027',
      status: 'under_review',
      submittedAt: '2026-03-09T11:20:00+01:00',
      updatedAt: '2026-03-12T08:30:00+01:00',
      earlyBirdEligible: true,
      earlyBirdDiscountMad: 1200,
      seatReserved: true,
      seatReservationCode: 'SEAT-LINA-26-771',
      documents: [
        { id: 'doc-id', label: 'Updated ID copy', status: 'uploaded', fileName: 'lina_parent_id.pdf', uploadedAt: '2026-03-09T11:14:00+01:00' },
        { id: 'doc-medical', label: 'Medical form', status: 'pending_review', fileName: 'lina_medical_2026.pdf', uploadedAt: '2026-03-09T11:15:00+01:00' },
        { id: 'doc-address', label: 'Proof of address', status: 'uploaded', fileName: 'lina_address.pdf', uploadedAt: '2026-03-09T11:17:00+01:00' }
      ]
    }),
    history: [
      historyItem({
        id: 'hist-lina-2025',
        yearLabel: '2025-2026',
        kind: 'enrollment',
        title: 'Enrollment Contract 2025-2026',
        summary: 'Primary enrollment terms for Grade 4, including service coverage and renewal obligations.',
        signedAt: '2025-08-17T19:04:00+01:00',
        pdfUrl: documentUrl('student-lina', 'history', 'CNT-LINA-2025-2026')
      }),
      historyItem({
        id: 'hist-lina-avenant-1',
        yearLabel: '2025-2026',
        kind: 'amendment',
        title: 'Avenant 01 - Meal Plan Adjustment',
        summary: 'Meal plan option switched from standard to allergy-safe package effective January 2026.',
        signedAt: '2026-01-07T10:12:00+01:00',
        pdfUrl: documentUrl('student-lina', 'amendment', 'AV-LINA-2026-01')
      }),
      historyItem({
        id: 'hist-lina-2024',
        yearLabel: '2024-2025',
        kind: 'enrollment',
        title: 'Enrollment Contract 2024-2025',
        summary: 'Archived agreement for previous school year.',
        signedAt: '2024-08-15T18:44:00+01:00',
        pdfUrl: documentUrl('student-lina', 'history', 'CNT-LINA-2024-2025')
      })
    ],
    yearlyComparison: [
      comparison({ id: 'cmp-duration', label: 'Contract duration', currentYearValue: '10 months', previousYearValue: '10 months', deltaLabel: 'No change' }),
      comparison({ id: 'cmp-renewal', label: 'Renewal deadline', currentYearValue: 'May 20, 2026', previousYearValue: 'May 25, 2025', deltaLabel: '5 days earlier' }),
      comparison({ id: 'cmp-cancellation', label: 'Cancellation notice', currentYearValue: '30 days', previousYearValue: '30 days', deltaLabel: 'No change' })
    ],
    alerts: [
      { id: 'alert-lina-expiry', type: 'expiry_30_days', title: 'Contract expiry reminder', detail: 'Current contract expires in 30 days. Renewal action is available in-app.', scheduledFor: '2026-05-31T09:00:00+01:00', status: 'scheduled' },
      { id: 'alert-lina-ready', type: 'ready_to_sign', title: 'Contract ready to sign', detail: 'Re-enrollment contract draft is ready for digital signature by both parents.', scheduledFor: '2026-04-10T09:00:00+01:00', status: 'sent' },
      { id: 'alert-lina-unsigned', type: 'unsigned_7_days', title: 'Signature reminder', detail: 'One parent signature is still pending 7 days after contract release.', scheduledFor: '2026-04-17T09:00:00+01:00', status: 'scheduled' }
    ]
  },
  'student-yanis': {
    current: current({
      id: 'contract-yanis-2025-2026',
      contractRef: 'CNT-YANIS-2025-2026',
      title: 'Enrollment Contract 2025-2026',
      startsAt: '2025-09-01T00:00:00+01:00',
      endsAt: '2026-06-30T23:59:59+01:00',
      renewalDate: '2026-05-22T23:59:59+01:00',
      status: 'active',
      fullContractUrl: documentUrl('student-yanis', 'current', 'CNT-YANIS-2025-2026'),
      terms: commonTerms,
      coverage: buildCoverage(true),
      cancellationPolicy: 'Cancellation requires 30-day notice with finance reconciliation before closure.',
      legalNote: 'Digital signatures follow Moroccan law 53-05 on electronic exchange and legal validity of e-signatures.'
    }),
    signers: [signer({ roleId: 'parent_1', label: 'Parent 1', fullName: 'Amira Bennani' }), signer({ roleId: 'parent_2', label: 'Parent 2', fullName: 'Karim Bennani' })],
    signatureLog: [
      signature({ id: 'sig-yanis-p1-2025', contractId: 'contract-yanis-2025-2026', roleId: 'parent_1', signedBy: 'Amira Bennani', signedAt: '2025-08-17T19:08:00+01:00', ipAddress: '41.137.22.18' }),
      signature({ id: 'sig-yanis-p2-2025', contractId: 'contract-yanis-2025-2026', roleId: 'parent_2', signedBy: 'Karim Bennani', signedAt: '2025-08-17T19:12:00+01:00', ipAddress: '41.137.22.19' })
    ],
    reEnrollment: reenrollment({
      id: 're-yanis-2026-2027',
      yearLabel: '2026-2027',
      status: 'submitted',
      submittedAt: '2026-03-12T09:40:00+01:00',
      updatedAt: '2026-03-12T09:40:00+01:00',
      earlyBirdEligible: true,
      earlyBirdDiscountMad: 900,
      seatReserved: false,
      seatReservationCode: null,
      documents: [
        { id: 'doc-id', label: 'Updated ID copy', status: 'uploaded', fileName: 'yanis_parent_id.pdf', uploadedAt: '2026-03-12T09:28:00+01:00' },
        { id: 'doc-medical', label: 'Medical form', status: 'missing', fileName: null, uploadedAt: null },
        { id: 'doc-address', label: 'Proof of address', status: 'uploaded', fileName: 'yanis_address.pdf', uploadedAt: '2026-03-12T09:32:00+01:00' }
      ]
    }),
    history: [
      historyItem({
        id: 'hist-yanis-2025',
        yearLabel: '2025-2026',
        kind: 'enrollment',
        title: 'Enrollment Contract 2025-2026',
        summary: 'Archived contract for Grade 1 with transport coverage add-on.',
        signedAt: '2025-08-17T19:12:00+01:00',
        pdfUrl: documentUrl('student-yanis', 'history', 'CNT-YANIS-2025-2026')
      }),
      historyItem({
        id: 'hist-yanis-2024',
        yearLabel: '2024-2025',
        kind: 'enrollment',
        title: 'Enrollment Contract 2024-2025',
        summary: 'Archived contract for previous cycle.',
        signedAt: '2024-08-12T17:30:00+01:00',
        pdfUrl: documentUrl('student-yanis', 'history', 'CNT-YANIS-2024-2025')
      })
    ],
    yearlyComparison: [
      comparison({ id: 'cmp-duration', label: 'Contract duration', currentYearValue: '10 months', previousYearValue: '10 months', deltaLabel: 'No change' }),
      comparison({ id: 'cmp-renewal', label: 'Renewal deadline', currentYearValue: 'May 22, 2026', previousYearValue: 'May 24, 2025', deltaLabel: '2 days earlier' }),
      comparison({ id: 'cmp-cancellation', label: 'Cancellation notice', currentYearValue: '30 days', previousYearValue: '30 days', deltaLabel: 'No change' })
    ],
    alerts: [
      { id: 'alert-yanis-expiry', type: 'expiry_30_days', title: 'Contract expiry reminder', detail: 'Current contract expires in 30 days. Re-enrollment form is available.', scheduledFor: '2026-06-01T09:00:00+01:00', status: 'scheduled' },
      { id: 'alert-yanis-ready', type: 'ready_to_sign', title: 'Contract ready to sign', detail: 'Next-year contract is ready for e-signature.', scheduledFor: '2026-04-12T09:00:00+01:00', status: 'scheduled' },
      { id: 'alert-yanis-unsigned', type: 'unsigned_7_days', title: 'Unsigned reminder', detail: 'You will receive a reminder if signatures are still pending after 7 days.', scheduledFor: '2026-04-19T09:00:00+01:00', status: 'scheduled' }
    ]
  },
  'student-adam': {
    current: current({
      id: 'contract-adam-2025-2026',
      contractRef: 'CNT-ADAM-2025-2026',
      title: 'Atlas Campus Enrollment Contract 2025-2026',
      startsAt: '2026-01-02T00:00:00+01:00',
      endsAt: '2026-06-30T23:59:59+01:00',
      renewalDate: '2026-05-25T23:59:59+01:00',
      status: 'expiring_soon',
      fullContractUrl: documentUrl('student-adam', 'current', 'CNT-ADAM-2025-2026'),
      terms: commonTerms,
      coverage: buildCoverage(false),
      cancellationPolicy: 'Cancellation during transition semester requires a 30-day notice and agreement with campus administration.',
      legalNote: 'Digital signatures follow Moroccan law 53-05 on electronic exchange and legal validity of e-signatures.'
    }),
    signers: [signer({ roleId: 'parent_1', label: 'Parent 1', fullName: 'Amira Bennani' }), signer({ roleId: 'parent_2', label: 'Parent 2', fullName: 'Karim Bennani' })],
    signatureLog: [signature({ id: 'sig-adam-p1-2026', contractId: 'contract-adam-2025-2026', roleId: 'parent_1', signedBy: 'Amira Bennani', signedAt: '2026-01-03T08:40:00+01:00', ipAddress: '41.137.22.18' })],
    reEnrollment: reenrollment({
      id: 're-adam-2026-2027',
      yearLabel: '2026-2027',
      status: 'confirmed',
      submittedAt: '2026-02-20T15:00:00+01:00',
      updatedAt: '2026-03-01T09:00:00+01:00',
      earlyBirdEligible: false,
      earlyBirdDiscountMad: null,
      seatReserved: true,
      seatReservationCode: 'SEAT-ADAM-26-304',
      documents: [
        { id: 'doc-id', label: 'Updated ID copy', status: 'uploaded', fileName: 'adam_parent_id.pdf', uploadedAt: '2026-02-20T14:52:00+01:00' },
        { id: 'doc-medical', label: 'Medical form', status: 'uploaded', fileName: 'adam_medical.pdf', uploadedAt: '2026-02-20T14:54:00+01:00' },
        { id: 'doc-address', label: 'Proof of address', status: 'uploaded', fileName: 'adam_address.pdf', uploadedAt: '2026-02-20T14:58:00+01:00' }
      ]
    }),
    history: [
      historyItem({
        id: 'hist-adam-2025',
        yearLabel: '2025-2026',
        kind: 'enrollment',
        title: 'Atlas Campus Enrollment Contract 2025-2026',
        summary: 'Transition contract for Atlas campus intake.',
        signedAt: '2026-01-03T08:40:00+01:00',
        pdfUrl: documentUrl('student-adam', 'history', 'CNT-ADAM-2025-2026')
      }),
      historyItem({
        id: 'hist-adam-avenant',
        yearLabel: '2025-2026',
        kind: 'amendment',
        title: 'Avenant 01 - Campus Transfer Conditions',
        summary: 'Amendment confirming transfer timeline and support conditions.',
        signedAt: '2026-01-15T16:20:00+01:00',
        pdfUrl: documentUrl('student-adam', 'amendment', 'AV-ADAM-2026-01')
      })
    ],
    yearlyComparison: [
      comparison({ id: 'cmp-duration', label: 'Contract duration', currentYearValue: '6 months (transition)', previousYearValue: '10 months', deltaLabel: 'Transition contract' }),
      comparison({ id: 'cmp-renewal', label: 'Renewal deadline', currentYearValue: 'May 25, 2026', previousYearValue: 'May 20, 2025', deltaLabel: '5 days later' }),
      comparison({ id: 'cmp-cancellation', label: 'Cancellation notice', currentYearValue: '30 days', previousYearValue: '30 days', deltaLabel: 'No change' })
    ],
    alerts: [
      { id: 'alert-adam-expiry', type: 'expiry_30_days', title: 'Contract expiry in 30 days', detail: 'Transition contract is approaching expiry. Renewal is recommended.', scheduledFor: '2026-05-31T09:00:00+01:00', status: 'sent' },
      { id: 'alert-adam-ready', type: 'ready_to_sign', title: 'New contract ready to sign', detail: 'Next-year contract is ready for co-signature.', scheduledFor: '2026-04-08T09:00:00+01:00', status: 'sent' },
      { id: 'alert-adam-unsigned', type: 'unsigned_7_days', title: 'Signature reminder', detail: 'Second parent signature is still pending after 7 days.', scheduledFor: '2026-04-15T09:00:00+01:00', status: 'scheduled' }
    ]
  },
  'student-salma': {
    current: current({
      id: 'contract-salma-2025-2026',
      contractRef: 'CNT-SALMA-2025-2026',
      title: 'Enrollment Contract 2025-2026',
      startsAt: '2025-09-01T00:00:00+01:00',
      endsAt: '2026-06-30T23:59:59+01:00',
      renewalDate: '2026-05-18T23:59:59+01:00',
      status: 'active',
      fullContractUrl: documentUrl('student-salma', 'current', 'CNT-SALMA-2025-2026'),
      terms: commonTerms,
      coverage: buildCoverage(false),
      cancellationPolicy: 'Cancellation requires 30-day notice and school validation of outstanding service usage.',
      legalNote: 'Digital signatures follow Moroccan law 53-05 on electronic exchange and legal validity of e-signatures.'
    }),
    signers: [signer({ roleId: 'parent_1', label: 'Parent 1', fullName: 'Samir El Mansouri' }), signer({ roleId: 'parent_2', label: 'Parent 2', fullName: 'Laila El Mansouri' })],
    signatureLog: [signature({ id: 'sig-salma-p1-2025', contractId: 'contract-salma-2025-2026', roleId: 'parent_1', signedBy: 'Samir El Mansouri', signedAt: '2025-08-16T17:21:00+01:00', ipAddress: '102.71.41.55' })],
    reEnrollment: reenrollment({
      id: 're-salma-2026-2027',
      yearLabel: '2026-2027',
      status: 'under_review',
      submittedAt: '2026-03-10T10:11:00+01:00',
      updatedAt: '2026-03-13T12:00:00+01:00',
      earlyBirdEligible: true,
      earlyBirdDiscountMad: 1500,
      seatReserved: true,
      seatReservationCode: 'SEAT-SALMA-26-117',
      documents: [
        { id: 'doc-id', label: 'Updated ID copy', status: 'uploaded', fileName: 'salma_parent_id.pdf', uploadedAt: '2026-03-10T10:00:00+01:00' },
        { id: 'doc-medical', label: 'Medical form', status: 'uploaded', fileName: 'salma_medical.pdf', uploadedAt: '2026-03-10T10:02:00+01:00' },
        { id: 'doc-address', label: 'Proof of address', status: 'pending_review', fileName: 'salma_address.pdf', uploadedAt: '2026-03-10T10:03:00+01:00' }
      ]
    }),
    history: [
      historyItem({
        id: 'hist-salma-2025',
        yearLabel: '2025-2026',
        kind: 'enrollment',
        title: 'Enrollment Contract 2025-2026',
        summary: 'Current contract archive with debate program annex.',
        signedAt: '2025-08-16T17:21:00+01:00',
        pdfUrl: documentUrl('student-salma', 'history', 'CNT-SALMA-2025-2026')
      })
    ],
    yearlyComparison: [
      comparison({ id: 'cmp-duration', label: 'Contract duration', currentYearValue: '10 months', previousYearValue: '10 months', deltaLabel: 'No change' }),
      comparison({ id: 'cmp-renewal', label: 'Renewal deadline', currentYearValue: 'May 18, 2026', previousYearValue: 'May 20, 2025', deltaLabel: '2 days earlier' }),
      comparison({ id: 'cmp-cancellation', label: 'Cancellation notice', currentYearValue: '30 days', previousYearValue: '30 days', deltaLabel: 'No change' })
    ],
    alerts: [
      { id: 'alert-salma-expiry', type: 'expiry_30_days', title: 'Contract expiry reminder', detail: 'Current contract expires in 30 days.', scheduledFor: '2026-05-30T09:00:00+01:00', status: 'scheduled' },
      { id: 'alert-salma-ready', type: 'ready_to_sign', title: 'Contract ready to sign', detail: 'Re-enrollment contract is prepared for digital signature.', scheduledFor: '2026-04-09T09:00:00+01:00', status: 'scheduled' },
      { id: 'alert-salma-unsigned', type: 'unsigned_7_days', title: '7-day signature reminder', detail: 'Reminder will be sent if contract is not signed within 7 days.', scheduledFor: '2026-04-16T09:00:00+01:00', status: 'scheduled' }
    ]
  }
}

import type {
  ChildFinanceRecord,
  FinancialFeeItemRecord,
  FinancialInstallmentOptionRecord,
  FinancialMonthlyStatusRecord,
  FinancialReminderRecord,
  FinancialRequestRecord
} from './types.ts'

function documentUrl(childId: string, type: 'invoice' | 'receipt' | 'tax-certificate' | 'agreement', ref?: string, year?: string) {
  const query = new URLSearchParams({ child: childId, type })
  if (ref) query.set('ref', ref)
  if (year) query.set('year', year)
  return `/api/parent/finance/document?${query.toString()}`
}

function feeItem(payload: FinancialFeeItemRecord): FinancialFeeItemRecord {
  return payload
}

function month(payload: FinancialMonthlyStatusRecord): FinancialMonthlyStatusRecord {
  return payload
}

function reminder(payload: FinancialReminderRecord): FinancialReminderRecord {
  return payload
}

function request(payload: FinancialRequestRecord): FinancialRequestRecord {
  return payload
}

const installmentOptions: FinancialInstallmentOptionRecord[] = [
  { count: 2, detail: 'Split the invoice into 2 equal payments across 60 days.', processingFeePercent: 0 },
  { count: 3, detail: 'Split into 3 payments with monthly due dates.', processingFeePercent: 0.5 },
  { count: 4, detail: 'Split into 4 payments with monthly due dates.', processingFeePercent: 1.2 }
]

const baseFees = (tuition: number, registration: number, mealPlan: number, transport: number, afterSchool: number, supplies: number, insurance: number, uniform: number): FinancialFeeItemRecord[] => [
  feeItem({ id: 'fee-tuition', category: 'tuition', label: 'Tuition', description: 'Core academic program for the school year.', frequency: 'annual', included: true, thisYearAmountMad: tuition, lastYearAmountMad: tuition - 1200 }),
  feeItem({ id: 'fee-registration', category: 'registration', label: 'Registration fee', description: 'Annual enrollment and records administration.', frequency: 'annual', included: false, thisYearAmountMad: registration, lastYearAmountMad: registration - 100 }),
  feeItem({ id: 'fee-meal', category: 'meal_plan', label: 'Cantine / Meal plan', description: 'Lunch and supervised meal service.', frequency: 'monthly', included: false, thisYearAmountMad: mealPlan, lastYearAmountMad: mealPlan - 300 }),
  feeItem({ id: 'fee-transport', category: 'transport', label: 'Transport', description: 'Morning and afternoon route operations.', frequency: 'monthly', included: false, thisYearAmountMad: transport, lastYearAmountMad: transport - 200 }),
  feeItem({ id: 'fee-after-school', category: 'after_school', label: 'After-school activities', description: 'Clubs and premium enrichment sessions.', frequency: 'termly', included: false, thisYearAmountMad: afterSchool, lastYearAmountMad: afterSchool - 150 }),
  feeItem({ id: 'fee-supplies', category: 'supplies', label: 'School supplies', description: 'Standard classroom consumables and workbook packs.', frequency: 'annual', included: true, thisYearAmountMad: supplies, lastYearAmountMad: supplies - 80 }),
  feeItem({ id: 'fee-insurance', category: 'insurance', label: 'Insurance', description: 'Student coverage for school activities and transport windows.', frequency: 'annual', included: true, thisYearAmountMad: insurance, lastYearAmountMad: insurance - 40 }),
  feeItem({ id: 'fee-uniform', category: 'uniform', label: 'Uniform', description: 'Required seasonal uniform kit.', frequency: 'optional', included: false, thisYearAmountMad: uniform, lastYearAmountMad: uniform - 70 })
]

const baseFaq = [
  { id: 'faq-1', question: 'What is included in tuition?', answer: 'Tuition includes academic instruction, in-class learning tools, and access to core school services.' },
  { id: 'faq-2', question: 'Are cantine and transport mandatory?', answer: 'No. Cantine and transport are optional and appear as separate line items when activated.' },
  { id: 'faq-3', question: 'Can I pay in installments?', answer: 'Yes. You can request 2, 3, or 4-installment plans directly from this module.' },
  { id: 'faq-4', question: 'How are fee changes communicated?', answer: 'Year-over-year fee comparison is shown per category, and approved updates are announced before billing.' }
]

export const childFinanceById: Record<string, ChildFinanceRecord> = {
  'student-lina': {
    feeItems: baseFees(32000, 2200, 6800, 5200, 2400, 1500, 900, 1300),
    feeFaq: baseFaq,
    monthlyStatus: [
      month({ monthId: '2025-09', monthLabel: 'Sep 2025', dueDateLabel: 'Sep 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2025-09-04T16:10:00+01:00' }),
      month({ monthId: '2025-10', monthLabel: 'Oct 2025', dueDateLabel: 'Oct 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2025-10-03T12:40:00+01:00' }),
      month({ monthId: '2025-11', monthLabel: 'Nov 2025', dueDateLabel: 'Nov 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2025-11-05T09:20:00+01:00' }),
      month({ monthId: '2025-12', monthLabel: 'Dec 2025', dueDateLabel: 'Dec 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2025-12-04T19:02:00+01:00' }),
      month({ monthId: '2026-01', monthLabel: 'Jan 2026', dueDateLabel: 'Jan 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2026-01-05T08:17:00+01:00' }),
      month({ monthId: '2026-02', monthLabel: 'Feb 2026', dueDateLabel: 'Feb 5', status: 'paid', amountDueMad: 4200, amountPaidMad: 4200, paidAt: '2026-02-04T14:11:00+01:00' }),
      month({ monthId: '2026-03', monthLabel: 'Mar 2026', dueDateLabel: 'Mar 8', status: 'overdue', amountDueMad: 4300, amountPaidMad: 1800, paidAt: '2026-03-09T11:45:00+01:00' }),
      month({ monthId: '2026-04', monthLabel: 'Apr 2026', dueDateLabel: 'Apr 5', status: 'pending', amountDueMad: 4300, amountPaidMad: 0, paidAt: null }),
      month({ monthId: '2026-05', monthLabel: 'May 2026', dueDateLabel: 'May 5', status: 'pending', amountDueMad: 4300, amountPaidMad: 0, paidAt: null }),
      month({ monthId: '2026-06', monthLabel: 'Jun 2026', dueDateLabel: 'Jun 5', status: 'pending', amountDueMad: 4300, amountPaidMad: 0, paidAt: null })
    ],
    paymentHistory: [
      {
        id: 'student-lina-pay-0904',
        postedAt: '2025-09-04T16:10:00+01:00',
        label: 'September tuition cycle',
        amountMad: 4200,
        method: 'CMI',
        status: 'confirmed',
        invoiceRef: 'INV-LINA-2025-09',
        receiptRef: 'RCT-LINA-2025-09',
        invoiceUrl: documentUrl('student-lina', 'invoice', 'INV-LINA-2025-09'),
        receiptUrl: documentUrl('student-lina', 'receipt', 'RCT-LINA-2025-09'),
        note: 'Paid in full before due date.'
      },
      {
        id: 'student-lina-pay-1003',
        postedAt: '2025-10-03T12:40:00+01:00',
        label: 'October tuition cycle',
        amountMad: 4200,
        method: 'Stripe',
        status: 'confirmed',
        invoiceRef: 'INV-LINA-2025-10',
        receiptRef: 'RCT-LINA-2025-10',
        invoiceUrl: documentUrl('student-lina', 'invoice', 'INV-LINA-2025-10'),
        receiptUrl: documentUrl('student-lina', 'receipt', 'RCT-LINA-2025-10'),
        note: 'Autopay successfully captured.'
      },
      {
        id: 'student-lina-pay-0204',
        postedAt: '2026-02-04T14:11:00+01:00',
        label: 'February tuition cycle',
        amountMad: 4200,
        method: 'PayPal',
        status: 'confirmed',
        invoiceRef: 'INV-LINA-2026-02',
        receiptRef: 'RCT-LINA-2026-02',
        invoiceUrl: documentUrl('student-lina', 'invoice', 'INV-LINA-2026-02'),
        receiptUrl: documentUrl('student-lina', 'receipt', 'RCT-LINA-2026-02'),
        note: 'Paid in one transaction.'
      },
      {
        id: 'student-lina-pay-0309',
        postedAt: '2026-03-09T11:45:00+01:00',
        label: 'March partial payment',
        amountMad: 1800,
        method: 'CMI',
        status: 'confirmed',
        invoiceRef: 'INV-LINA-2026-03',
        receiptRef: 'RCT-LINA-2026-03A',
        invoiceUrl: documentUrl('student-lina', 'invoice', 'INV-LINA-2026-03'),
        receiptUrl: documentUrl('student-lina', 'receipt', 'RCT-LINA-2026-03A'),
        note: 'Partial payment received. Remaining balance tracked as overdue.'
      }
    ],
    reminders: [
      reminder({ id: 'lina-rem-7', invoiceRef: 'INV-LINA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 7, channel: 'push', status: 'scheduled' }),
      reminder({ id: 'lina-rem-3', invoiceRef: 'INV-LINA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 3, channel: 'email', status: 'scheduled' }),
      reminder({ id: 'lina-rem-1', invoiceRef: 'INV-LINA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 1, channel: 'sms', status: 'scheduled' })
    ],
    lateNotices: [
      { id: 'lina-late-2026-03', invoiceRef: 'INV-LINA-2026-03', raisedAt: '2026-03-09T08:00:00+01:00', detail: 'March invoice is partially paid. MAD 2,500 remains overdue.', escalation: 'Finance office follow-up active until balance is cleared.' }
    ],
    gateways: [
      { id: 'gw-cmi', label: 'CMI (Morocco)', enabled: true, detail: 'Primary local card gateway for Moroccan schools.' },
      { id: 'gw-stripe', label: 'Stripe', enabled: true, detail: 'International card support and autopay options.' },
      { id: 'gw-paypal', label: 'PayPal', enabled: true, detail: 'Wallet and card checkout option.' }
    ],
    installmentOptions,
    requests: [
      request({
        id: 'fin-req-lina-1',
        childId: 'student-lina',
        type: 'installment_plan',
        status: 'reviewing',
        createdAt: '2026-03-10T12:15:00+01:00',
        updatedAt: '2026-03-12T09:10:00+01:00',
        requestedAmountMad: 2500,
        detail: 'Request to split remaining March balance into 2 payments.',
        agreementUrl: documentUrl('student-lina', 'agreement', 'AGR-LINA-2026-03'),
        decisionNote: 'Finance team requested one additional supporting note.'
      })
    ],
    taxDocuments: [
      { id: 'tax-lina-2024-2025', yearLabel: '2024-2025', generatedAt: '2025-12-31T20:00:00+01:00', amountPaidMad: 47100, status: 'available', downloadUrl: documentUrl('student-lina', 'tax-certificate', undefined, '2024-2025') },
      { id: 'tax-lina-2025-2026', yearLabel: '2025-2026', generatedAt: '2026-12-31T20:00:00+01:00', amountPaidMad: 0, status: 'scheduled', downloadUrl: documentUrl('student-lina', 'tax-certificate', undefined, '2025-2026') }
    ],
    recurringEnabled: true,
    partialPaymentMinMad: 300,
    securityComplianceNote: 'All online transactions are processed through PCI DSS compliant gateways with digital receipts.',
    autoGenerationNote: 'Annual fee certificates are auto-generated at year end and remain downloadable at any time.'
  },
  'student-yanis': {
    feeItems: baseFees(29500, 2100, 6400, 5000, 2100, 1400, 850, 1200),
    feeFaq: baseFaq,
    monthlyStatus: [
      month({ monthId: '2025-09', monthLabel: 'Sep 2025', dueDateLabel: 'Sep 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2025-09-03T13:00:00+01:00' }),
      month({ monthId: '2025-10', monthLabel: 'Oct 2025', dueDateLabel: 'Oct 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2025-10-04T09:32:00+01:00' }),
      month({ monthId: '2025-11', monthLabel: 'Nov 2025', dueDateLabel: 'Nov 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2025-11-04T20:02:00+01:00' }),
      month({ monthId: '2025-12', monthLabel: 'Dec 2025', dueDateLabel: 'Dec 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2025-12-03T11:17:00+01:00' }),
      month({ monthId: '2026-01', monthLabel: 'Jan 2026', dueDateLabel: 'Jan 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2026-01-04T14:51:00+01:00' }),
      month({ monthId: '2026-02', monthLabel: 'Feb 2026', dueDateLabel: 'Feb 5', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2026-02-04T10:26:00+01:00' }),
      month({ monthId: '2026-03', monthLabel: 'Mar 2026', dueDateLabel: 'Mar 8', status: 'paid', amountDueMad: 3900, amountPaidMad: 3900, paidAt: '2026-03-07T19:20:00+01:00' }),
      month({ monthId: '2026-04', monthLabel: 'Apr 2026', dueDateLabel: 'Apr 5', status: 'pending', amountDueMad: 3900, amountPaidMad: 0, paidAt: null }),
      month({ monthId: '2026-05', monthLabel: 'May 2026', dueDateLabel: 'May 5', status: 'pending', amountDueMad: 3900, amountPaidMad: 0, paidAt: null })
    ],
    paymentHistory: [
      {
        id: 'student-yanis-pay-0104',
        postedAt: '2026-01-04T14:51:00+01:00',
        label: 'January tuition cycle',
        amountMad: 3900,
        method: 'Stripe',
        status: 'confirmed',
        invoiceRef: 'INV-YANIS-2026-01',
        receiptRef: 'RCT-YANIS-2026-01',
        invoiceUrl: documentUrl('student-yanis', 'invoice', 'INV-YANIS-2026-01'),
        receiptUrl: documentUrl('student-yanis', 'receipt', 'RCT-YANIS-2026-01'),
        note: 'Autopay cycle completed.'
      },
      {
        id: 'student-yanis-pay-0204',
        postedAt: '2026-02-04T10:26:00+01:00',
        label: 'February tuition cycle',
        amountMad: 3900,
        method: 'Stripe',
        status: 'confirmed',
        invoiceRef: 'INV-YANIS-2026-02',
        receiptRef: 'RCT-YANIS-2026-02',
        invoiceUrl: documentUrl('student-yanis', 'invoice', 'INV-YANIS-2026-02'),
        receiptUrl: documentUrl('student-yanis', 'receipt', 'RCT-YANIS-2026-02'),
        note: 'Autopay cycle completed.'
      },
      {
        id: 'student-yanis-pay-0307',
        postedAt: '2026-03-07T19:20:00+01:00',
        label: 'March tuition cycle',
        amountMad: 3900,
        method: 'PayPal',
        status: 'confirmed',
        invoiceRef: 'INV-YANIS-2026-03',
        receiptRef: 'RCT-YANIS-2026-03',
        invoiceUrl: documentUrl('student-yanis', 'invoice', 'INV-YANIS-2026-03'),
        receiptUrl: documentUrl('student-yanis', 'receipt', 'RCT-YANIS-2026-03'),
        note: 'Paid in one wallet transaction.'
      }
    ],
    reminders: [
      reminder({ id: 'yanis-rem-7', invoiceRef: 'INV-YANIS-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 7, channel: 'push', status: 'scheduled' }),
      reminder({ id: 'yanis-rem-3', invoiceRef: 'INV-YANIS-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 3, channel: 'email', status: 'scheduled' }),
      reminder({ id: 'yanis-rem-1', invoiceRef: 'INV-YANIS-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 1, channel: 'sms', status: 'scheduled' })
    ],
    lateNotices: [],
    gateways: [
      { id: 'gw-cmi', label: 'CMI (Morocco)', enabled: true, detail: 'Primary local card gateway for Moroccan schools.' },
      { id: 'gw-stripe', label: 'Stripe', enabled: true, detail: 'International card support and autopay options.' },
      { id: 'gw-paypal', label: 'PayPal', enabled: true, detail: 'Wallet and card checkout option.' }
    ],
    installmentOptions,
    requests: [],
    taxDocuments: [
      { id: 'tax-yanis-2024-2025', yearLabel: '2024-2025', generatedAt: '2025-12-31T20:00:00+01:00', amountPaidMad: 43500, status: 'available', downloadUrl: documentUrl('student-yanis', 'tax-certificate', undefined, '2024-2025') }
    ],
    recurringEnabled: true,
    partialPaymentMinMad: 300,
    securityComplianceNote: 'All online transactions are processed through PCI DSS compliant gateways with digital receipts.',
    autoGenerationNote: 'Annual fee certificates are auto-generated at year end and remain downloadable at any time.'
  },
  'student-adam': {
    feeItems: baseFees(26000, 2000, 5600, 0, 1800, 1200, 820, 1100),
    feeFaq: baseFaq,
    monthlyStatus: [
      month({ monthId: '2026-01', monthLabel: 'Jan 2026', dueDateLabel: 'Jan 8', status: 'paid', amountDueMad: 3200, amountPaidMad: 3200, paidAt: '2026-01-07T16:15:00+01:00' }),
      month({ monthId: '2026-02', monthLabel: 'Feb 2026', dueDateLabel: 'Feb 8', status: 'paid', amountDueMad: 3200, amountPaidMad: 3200, paidAt: '2026-02-07T10:22:00+01:00' }),
      month({ monthId: '2026-03', monthLabel: 'Mar 2026', dueDateLabel: 'Mar 8', status: 'pending', amountDueMad: 3200, amountPaidMad: 0, paidAt: null }),
      month({ monthId: '2026-04', monthLabel: 'Apr 2026', dueDateLabel: 'Apr 8', status: 'pending', amountDueMad: 3200, amountPaidMad: 0, paidAt: null })
    ],
    paymentHistory: [
      {
        id: 'student-adam-pay-0107',
        postedAt: '2026-01-07T16:15:00+01:00',
        label: 'Transition campus invoice',
        amountMad: 3200,
        method: 'CMI',
        status: 'confirmed',
        invoiceRef: 'INV-ADAM-2026-01',
        receiptRef: 'RCT-ADAM-2026-01',
        invoiceUrl: documentUrl('student-adam', 'invoice', 'INV-ADAM-2026-01'),
        receiptUrl: documentUrl('student-adam', 'receipt', 'RCT-ADAM-2026-01'),
        note: 'Paid during campus transition onboarding.'
      }
    ],
    reminders: [
      reminder({ id: 'adam-rem-7', invoiceRef: 'INV-ADAM-2026-03', dueAt: '2026-03-08T23:59:59+01:00', triggerDaysBefore: 7, channel: 'push', status: 'sent' }),
      reminder({ id: 'adam-rem-3', invoiceRef: 'INV-ADAM-2026-03', dueAt: '2026-03-08T23:59:59+01:00', triggerDaysBefore: 3, channel: 'email', status: 'sent' }),
      reminder({ id: 'adam-rem-1', invoiceRef: 'INV-ADAM-2026-03', dueAt: '2026-03-08T23:59:59+01:00', triggerDaysBefore: 1, channel: 'sms', status: 'sent' })
    ],
    lateNotices: [],
    gateways: [
      { id: 'gw-cmi', label: 'CMI (Morocco)', enabled: true, detail: 'Primary local card gateway for Moroccan schools.' },
      { id: 'gw-stripe', label: 'Stripe', enabled: true, detail: 'International card support and autopay options.' },
      { id: 'gw-paypal', label: 'PayPal', enabled: true, detail: 'Wallet and card checkout option.' }
    ],
    installmentOptions,
    requests: [
      request({
        id: 'fin-req-adam-1',
        childId: 'student-adam',
        type: 'scholarship',
        status: 'submitted',
        createdAt: '2026-03-11T09:02:00+01:00',
        updatedAt: '2026-03-11T09:02:00+01:00',
        requestedAmountMad: 1800,
        detail: 'Requesting transition support scholarship for second semester.',
        agreementUrl: null,
        decisionNote: null
      })
    ],
    taxDocuments: [
      { id: 'tax-adam-2025-2026', yearLabel: '2025-2026', generatedAt: '2026-12-31T20:00:00+01:00', amountPaidMad: 6400, status: 'scheduled', downloadUrl: documentUrl('student-adam', 'tax-certificate', undefined, '2025-2026') }
    ],
    recurringEnabled: false,
    partialPaymentMinMad: 250,
    securityComplianceNote: 'All online transactions are processed through PCI DSS compliant gateways with digital receipts.',
    autoGenerationNote: 'Annual fee certificates are auto-generated at year end and remain downloadable at any time.'
  },
  'student-salma': {
    feeItems: baseFees(35500, 2400, 6900, 0, 3000, 1600, 940, 1400),
    feeFaq: baseFaq,
    monthlyStatus: [
      month({ monthId: '2025-09', monthLabel: 'Sep 2025', dueDateLabel: 'Sep 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2025-09-02T10:55:00+01:00' }),
      month({ monthId: '2025-10', monthLabel: 'Oct 2025', dueDateLabel: 'Oct 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2025-10-02T10:58:00+01:00' }),
      month({ monthId: '2025-11', monthLabel: 'Nov 2025', dueDateLabel: 'Nov 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2025-11-02T11:02:00+01:00' }),
      month({ monthId: '2025-12', monthLabel: 'Dec 2025', dueDateLabel: 'Dec 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2025-12-03T10:36:00+01:00' }),
      month({ monthId: '2026-01', monthLabel: 'Jan 2026', dueDateLabel: 'Jan 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2026-01-04T10:47:00+01:00' }),
      month({ monthId: '2026-02', monthLabel: 'Feb 2026', dueDateLabel: 'Feb 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2026-02-04T11:12:00+01:00' }),
      month({ monthId: '2026-03', monthLabel: 'Mar 2026', dueDateLabel: 'Mar 5', status: 'paid', amountDueMad: 4500, amountPaidMad: 4500, paidAt: '2026-03-03T09:08:00+01:00' })
    ],
    paymentHistory: [
      {
        id: 'student-salma-pay-0303',
        postedAt: '2026-03-03T09:08:00+01:00',
        label: 'March tuition cycle',
        amountMad: 4500,
        method: 'Bank transfer',
        status: 'confirmed',
        invoiceRef: 'INV-SALMA-2026-03',
        receiptRef: 'RCT-SALMA-2026-03',
        invoiceUrl: documentUrl('student-salma', 'invoice', 'INV-SALMA-2026-03'),
        receiptUrl: documentUrl('student-salma', 'receipt', 'RCT-SALMA-2026-03'),
        note: 'Wire transfer confirmed by finance team.'
      }
    ],
    reminders: [
      reminder({ id: 'salma-rem-7', invoiceRef: 'INV-SALMA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 7, channel: 'push', status: 'scheduled' }),
      reminder({ id: 'salma-rem-3', invoiceRef: 'INV-SALMA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 3, channel: 'email', status: 'scheduled' }),
      reminder({ id: 'salma-rem-1', invoiceRef: 'INV-SALMA-2026-04', dueAt: '2026-04-05T23:59:59+01:00', triggerDaysBefore: 1, channel: 'sms', status: 'scheduled' })
    ],
    lateNotices: [],
    gateways: [
      { id: 'gw-cmi', label: 'CMI (Morocco)', enabled: true, detail: 'Primary local card gateway for Moroccan schools.' },
      { id: 'gw-stripe', label: 'Stripe', enabled: true, detail: 'International card support and autopay options.' },
      { id: 'gw-paypal', label: 'PayPal', enabled: true, detail: 'Wallet and card checkout option.' }
    ],
    installmentOptions,
    requests: [
      request({
        id: 'fin-req-salma-1',
        childId: 'student-salma',
        type: 'discount',
        status: 'approved',
        createdAt: '2026-02-09T08:20:00+01:00',
        updatedAt: '2026-02-12T15:00:00+01:00',
        requestedAmountMad: 900,
        detail: 'Sibling discount request for extracurricular package.',
        agreementUrl: documentUrl('student-salma', 'agreement', 'AGR-SALMA-2026-02'),
        decisionNote: 'Approved for current term. Applied on March invoice.'
      })
    ],
    taxDocuments: [
      { id: 'tax-salma-2024-2025', yearLabel: '2024-2025', generatedAt: '2025-12-31T20:00:00+01:00', amountPaidMad: 51200, status: 'available', downloadUrl: documentUrl('student-salma', 'tax-certificate', undefined, '2024-2025') }
    ],
    recurringEnabled: true,
    partialPaymentMinMad: 350,
    securityComplianceNote: 'All online transactions are processed through PCI DSS compliant gateways with digital receipts.',
    autoGenerationNote: 'Annual fee certificates are auto-generated at year end and remain downloadable at any time.'
  }
}

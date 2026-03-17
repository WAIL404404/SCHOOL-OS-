export type ValueOf<T> = T[keyof T]

export const USER_ROLES = {
  superAdmin: 'super_admin',
  schoolAdmin: 'school_admin',
  teacher: 'teacher',
  parent: 'parent',
  transportDriver: 'transport_driver',
  supervisor: 'supervisor'
} as const

export type UserRole = ValueOf<typeof USER_ROLES>

export interface NavigationItem {
  label: string
  route: string
  description: string
}

export interface SchoolBrand {
  id: string
  code: string
  name: string
  campus: string
  supportEmail: string
  accent: string
  greeting: string
}

export interface DeviceRecord {
  id: string
  name: string
  location: string
  lastActiveAt: string
  trusted: boolean
  current?: boolean
}

export interface LessonRecord {
  time: string
  subject: string
}

export interface AlertRecord {
  id: string
  tone: 'warning' | 'info' | 'calm'
  title: string
  detail: string
}

export interface TransportRecord {
  status: string | null
  detail: string | null
  tone: 'live' | 'confirmed' | 'pending' | null
}

export interface AcademicScheduleEntryRecord {
  id: string
  dayId: string
  dayLabel: string
  dateLabel: string
  startsAt: string
  endsAt: string
  subject: string
  teacher: string
  room: string
  color: string
  notificationLeadMinutes: number
  isExamDay?: boolean
  note?: string | null
  changeLabel?: string | null
}

export interface AcademicScheduleUpdateRecord {
  id: string
  tone: 'warning' | 'info' | 'calm'
  title: string
  detail: string
  effectiveAt: string
}

export interface AcademicGradePointRecord {
  label: string
  score: number
  classAverage: number
}

export interface AcademicSubjectGradeRecord {
  id: string
  subject: string
  color: string
  latestGrade: string
  classAverage: string
  teacherComment: string
  ranking: string | null
  breakdown: string[]
  trimesterDelta: string
  yearOverYear: string
}

export interface AcademicReportCardRecord {
  trimesterLabel: string
  publishedAt: string
  termId: string
}

export interface AcademicHomeworkAttachmentRecord {
  label: string
  kind: 'pdf' | 'image' | 'link'
  url: string
}

export interface AcademicHomeworkRecord {
  id: string
  subject: string
  color: string
  title: string
  dueAt: string
  status: 'submitted' | 'pending' | 'late'
  attachments: AcademicHomeworkAttachmentRecord[]
  feedback: string | null
  parentNotification: string | null
  submittedAt: string | null
}

export interface AcademicExamResourceRecord {
  label: string
  url: string
}

export interface AcademicExamRecord {
  id: string
  subject: string
  color: string
  startsAt: string
  endsAt: string
  room: string
  syllabus: string[]
  result: string | null
  reminderDate: string
  resources: AcademicExamResourceRecord[]
  retake: string | null
}

export interface AcademicAttendanceStatRecord {
  label: string
  value: string
  detail: string
}

export interface AcademicAttendanceDayRecord {
  id: string
  dateLabel: string
  status: 'present' | 'absent' | 'late'
  reason: string | null
  justified: boolean
  note: string
}

export interface AcademicAttendanceRecord {
  todayStatus: 'present' | 'absent' | 'late'
  todayDetail: string
  notification: string
  stats: AcademicAttendanceStatRecord[]
  history: AcademicAttendanceDayRecord[]
  impact: string
  absenceGuidance: string
}

export interface ChildAcademicsRecord {
  overallAverage: string
  classAverage: string
  yearComparison: string
  rankingEnabled: boolean
  reportCard: AcademicReportCardRecord | null
  scheduleEntries: AcademicScheduleEntryRecord[]
  scheduleUpdates: AcademicScheduleUpdateRecord[]
  gradePoints: AcademicGradePointRecord[]
  subjectGrades: AcademicSubjectGradeRecord[]
  homework: AcademicHomeworkRecord[]
  exams: AcademicExamRecord[]
  attendance: AcademicAttendanceRecord
}

export interface ChildRecord {
  id: string
  fullName: string
  gradeLabel: string
  classLabel: string
  attendanceSummary: string | null
  latestHighlight: string | null
  statusTone: string
  school: SchoolBrand
  averageScore: string | null
  averageLabel: string | null
  attendanceRate: string | null
  behaviorRating: number | null
  behaviorLabel: string | null
  alerts: AlertRecord[]
  schedule: LessonRecord[]
  transport: TransportRecord
  news: string | null
  achievement: string | null
  academics?: ChildAcademicsRecord | null
}

export interface RecoveryChannels {
  sms?: string
  whatsapp?: string
}

export interface UserCredentials {
  schoolCode: string
  email: string
  password: string
  accessCode: string
  inviteCode?: string
}

export interface UserProfile {
  displayName: string
}

export interface ComplaintRecord {
  id: string
  title: string
  status: string
  openedAt: string
  summary: string
}

export interface UpdateRecord {
  id: string
  title: string
  body: string
}

export interface FeeSummary {
  paidLabel: string | null
  dueLabel: string | null
}

export interface DashboardSummary {
  attendanceRate: string | null
  fees: FeeSummary
  upcomingEvents: number
  transportStatus: string | null
  latestStatus: string | null
}

export interface WorkspaceMetric {
  label: string
  value: string
  detail: string
}

export interface WorkspaceSummary {
  title: string
  description: string
  metrics: WorkspaceMetric[]
  priorities: string[]
}

export interface BaseUserAccount {
  id: string
  role: UserRole
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  credentials: UserCredentials
  profile: UserProfile
  recovery: RecoveryChannels
  biometricEnabled: boolean
  needsOnboarding: boolean
  knownDevices: DeviceRecord[]
  workspaceSummary?: WorkspaceSummary
}

export interface ParentAccount extends BaseUserAccount {
  role: typeof USER_ROLES.parent
  children: ChildRecord[]
  dashboardSummary: DashboardSummary
  complaints: ComplaintRecord[]
  recentUpdates: UpdateRecord[]
}

export type SeedUser = ParentAccount | BaseUserAccount

export interface SessionRecord {
  accountId: string
  role: UserRole
  schoolId: string
  schoolName: string
  displayName: string
  deviceId: string
  signedInAt: string
  lastActiveAt: string
}

export interface DemoLoginOption {
  label: string
  role: UserRole
  roleLabel: string
  schoolCode: string
  email: string
  password: string
  accessCode: string
  biometricEnabled: boolean
  summary: string
}

export interface JoinInvite {
  inviteCode: string
  accountId: string
  schoolName: string
  title: string
  linkedChildren: string[]
  linkedSchools: string[]
}

export interface QuickActionModule {
  title: string
  body: string
  route: string
}

export interface ViewDevice extends DeviceRecord {
  lastActiveLabel: string
}

export interface ChildTabView {
  id: string
  fullName: string
  gradeLabel: string
  schoolName: string
  initials: string
  isActive: boolean
}

export interface QuickStatView {
  label: string
  value: string
  detail: string
}

export interface ComplaintState {
  empty: boolean
  title: string
  description: string
  items: ComplaintRecord[]
}

export interface ParentDashboardView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  greeting: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  quickStats: QuickStatView[]
  alerts: AlertRecord[]
  schedule: LessonRecord[]
  transport: {
    status: string
    detail: string
    toneLabel: string
  }
  latestNews: string
  achievement: string
  complaintState: ComplaintState
  recentUpdates: UpdateRecord[]
  quickActions: QuickActionModule[]
  summaryStrip: {
    fees: string
    events: string
    transport: string
  }
}

export interface AcademicCalendarLinkView {
  label: string
  href: string
  kind: 'google' | 'apple'
}

export interface AcademicScheduleDayView {
  dayId: string
  dayLabel: string
  dateLabel: string
  hasExam: boolean
  entries: AcademicScheduleEntryRecord[]
}

export interface AcademicGradeChartPointView {
  label: string
  score: number
  scoreLabel: string
  scoreHeight: number
  classAverage: number
  classAverageLabel: string
  classAverageHeight: number
}

export interface AcademicReportCardView extends AcademicReportCardRecord {
  downloadUrl: string
}

export interface AcademicHomeworkSummaryView {
  submitted: number
  pending: number
  late: number
}

export interface AcademicHomeworkCalendarItemView {
  id: string
  title: string
  subject: string
  dueAt: string
  status: 'submitted' | 'pending' | 'late'
}

export interface AcademicHomeworkCalendarDayView {
  dayKey: string
  dayLabel: string
  items: AcademicHomeworkCalendarItemView[]
}

export interface AcademicAbsenceReasonRecord {
  id: string
  childId: string
  reason: string
  createdAt: string
  status: 'submitted' | 'reviewing'
}

export interface AcademicRealtimeNotificationView {
  id: string
  childId: string
  title: string
  detail: string
  tone: 'warning' | 'info' | 'calm'
  source: 'schedule' | 'homework' | 'exam' | 'attendance' | 'absence' | 'hook'
  createdAt: string
}

export interface AcademicAttendanceBadgeView {
  label: string
  tone: 'success' | 'danger' | 'warning' | 'neutral'
}

export interface ParentAcademicsView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  schedule: {
    days: AcademicScheduleDayView[]
    updates: AcademicScheduleUpdateRecord[]
    calendarLinks: AcademicCalendarLinkView[]
    examDayLabels: string[]
  }
  grades: {
    overallAverage: string
    classAverage: string
    yearComparison: string
    rankingEnabled: boolean
    reportCard: AcademicReportCardView | null
    chart: AcademicGradeChartPointView[]
    subjects: AcademicSubjectGradeRecord[]
  }
  homework: {
    items: AcademicHomeworkRecord[]
    summary: AcademicHomeworkSummaryView
    parentAlerts: string[]
    calendarDays: AcademicHomeworkCalendarDayView[]
  }
  exams: {
    items: AcademicExamRecord[]
    nextReminder: string
  }
  attendance: {
    badge: AcademicAttendanceBadgeView
    detail: string
    notification: string
    stats: AcademicAttendanceStatRecord[]
    history: AcademicAttendanceDayRecord[]
    impact: string
    absenceGuidance: string
  }
}

export type FinancialFeeCategory =
  | 'tuition'
  | 'registration'
  | 'meal_plan'
  | 'transport'
  | 'after_school'
  | 'supplies'
  | 'insurance'
  | 'uniform'

export interface FinancialFeeItemRecord {
  id: string
  category: FinancialFeeCategory
  label: string
  description: string
  frequency: 'annual' | 'monthly' | 'termly' | 'optional'
  included: boolean
  thisYearAmountMad: number
  lastYearAmountMad: number
}

export interface FinancialFeeFaqRecord {
  id: string
  question: string
  answer: string
}

export interface FinancialMonthlyStatusRecord {
  monthId: string
  monthLabel: string
  dueDateLabel: string
  status: 'paid' | 'pending' | 'overdue'
  amountDueMad: number
  amountPaidMad: number
  paidAt: string | null
}

export interface FinancialPaymentHistoryRecord {
  id: string
  postedAt: string
  label: string
  amountMad: number
  method: 'CMI' | 'Stripe' | 'PayPal' | 'Bank transfer' | 'Cashdesk'
  status: 'confirmed' | 'pending' | 'failed'
  invoiceRef: string
  receiptRef: string | null
  invoiceUrl: string
  receiptUrl: string | null
  note: string | null
}

export interface FinancialReminderRecord {
  id: string
  invoiceRef: string
  dueAt: string
  triggerDaysBefore: 7 | 3 | 1
  channel: 'push' | 'email' | 'sms' | 'whatsapp'
  status: 'scheduled' | 'sent'
}

export interface FinancialLateNoticeRecord {
  id: string
  invoiceRef: string
  raisedAt: string
  detail: string
  escalation: string
}

export interface FinancialGatewayRecord {
  id: string
  label: 'CMI (Morocco)' | 'Stripe' | 'PayPal'
  enabled: boolean
  detail: string
}

export interface FinancialInstallmentOptionRecord {
  count: 2 | 3 | 4
  detail: string
  processingFeePercent: number
}

export interface FinancialRequestRecord {
  id: string
  childId: string
  type: 'installment_plan' | 'discount' | 'scholarship'
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  requestedAmountMad: number | null
  detail: string
  agreementUrl: string | null
  decisionNote: string | null
}

export interface FinancialTaxDocumentRecord {
  id: string
  yearLabel: string
  generatedAt: string
  amountPaidMad: number
  status: 'available' | 'scheduled'
  downloadUrl: string
}

export interface ChildFinanceRecord {
  feeItems: FinancialFeeItemRecord[]
  feeFaq: FinancialFeeFaqRecord[]
  monthlyStatus: FinancialMonthlyStatusRecord[]
  paymentHistory: FinancialPaymentHistoryRecord[]
  reminders: FinancialReminderRecord[]
  lateNotices: FinancialLateNoticeRecord[]
  gateways: FinancialGatewayRecord[]
  installmentOptions: FinancialInstallmentOptionRecord[]
  requests: FinancialRequestRecord[]
  taxDocuments: FinancialTaxDocumentRecord[]
  recurringEnabled: boolean
  partialPaymentMinMad: number
  securityComplianceNote: string
  autoGenerationNote: string
}

export interface ParentFinancialView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  fees: {
    items: FinancialFeeItemRecord[]
    includedCount: number
    extraCount: number
    totalThisYearMad: number
    totalLastYearMad: number
    yearOverYearLabel: string
    faq: FinancialFeeFaqRecord[]
  }
  paymentTracking: {
    monthlyStatus: FinancialMonthlyStatusRecord[]
    history: FinancialPaymentHistoryRecord[]
    reminders: FinancialReminderRecord[]
    lateNotices: FinancialLateNoticeRecord[]
    totalPaidThisYearMad: number
    totalOutstandingMad: number
  }
  onlinePayment: {
    gateways: FinancialGatewayRecord[]
    installmentOptions: FinancialInstallmentOptionRecord[]
    partialPaymentMinMad: number
    recurringEnabled: boolean
    securityComplianceNote: string
  }
  requests: {
    items: FinancialRequestRecord[]
  }
  taxDocuments: {
    items: FinancialTaxDocumentRecord[]
    autoGenerationNote: string
  }
}

export interface ContractTermRecord {
  id: string
  title: string
  detail: string
}

export interface ContractCoverageRecord {
  id: string
  label: string
  included: boolean
  detail: string
}

export interface ContractCurrentRecord {
  id: string
  contractRef: string
  title: string
  startsAt: string
  endsAt: string
  renewalDate: string
  status: 'active' | 'expiring_soon' | 'expired'
  fullContractUrl: string
  terms: ContractTermRecord[]
  coverage: ContractCoverageRecord[]
  cancellationPolicy: string
  legalNote: string
}

export interface ContractSignerRecord {
  roleId: 'parent_1' | 'parent_2'
  label: string
  fullName: string
}

export interface ContractSignatureLogRecord {
  id: string
  contractId: string
  roleId: ContractSignerRecord['roleId']
  signedBy: string
  signedAt: string
  ipAddress: string
}

export interface ContractSignerStatusView extends ContractSignerRecord {
  status: 'signed' | 'pending'
  signedAt: string | null
  ipAddress: string | null
}

export interface ContractReEnrollmentDocumentRecord {
  id: string
  label: string
  status: 'uploaded' | 'missing' | 'pending_review'
  fileName: string | null
  uploadedAt: string | null
}

export interface ContractReEnrollmentRecord {
  id: string
  yearLabel: string
  status: 'submitted' | 'under_review' | 'confirmed'
  submittedAt: string
  updatedAt: string
  earlyBirdEligible: boolean
  earlyBirdDiscountMad: number | null
  seatReserved: boolean
  seatReservationCode: string | null
  documents: ContractReEnrollmentDocumentRecord[]
}

export interface ContractHistoryRecord {
  id: string
  yearLabel: string
  kind: 'enrollment' | 'amendment'
  title: string
  summary: string
  signedAt: string
  pdfUrl: string
}

export interface ContractYearComparisonRecord {
  id: string
  label: string
  currentYearValue: string
  previousYearValue: string
  deltaLabel: string
}

export interface ContractAlertRecord {
  id: string
  type: 'expiry_30_days' | 'ready_to_sign' | 'unsigned_7_days'
  title: string
  detail: string
  scheduledFor: string
  status: 'scheduled' | 'sent'
}

export interface ChildContractsRecord {
  current: ContractCurrentRecord
  signers: ContractSignerRecord[]
  signatureLog: ContractSignatureLogRecord[]
  reEnrollment: ContractReEnrollmentRecord
  history: ContractHistoryRecord[]
  yearlyComparison: ContractYearComparisonRecord[]
  alerts: ContractAlertRecord[]
}

export interface ParentContractsView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  currentContract: ContractCurrentRecord | null
  digitalSignature: {
    signers: ContractSignerStatusView[]
    signatureLog: ContractSignatureLogRecord[]
    legalNote: string
  }
  reEnrollment: ContractReEnrollmentRecord | null
  history: {
    items: ContractHistoryRecord[]
    yearlyComparison: ContractYearComparisonRecord[]
  }
  alerts: {
    items: ContractAlertRecord[]
  }
}

export type ActivityCategory = 'sports' | 'arts' | 'tech' | 'languages' | 'tutoring'

export interface ActivityInstructorRecord {
  id: string
  fullName: string
  title: string
  bio: string
  qualifications: string[]
}

export interface ActivityPriceRecord {
  perSessionMad: number
  perMonthMad: number | null
  perTrimesterMad: number | null
}

export interface ActivityMediaRecord {
  id: string
  kind: 'image' | 'video'
  label: string
  url: string
}

export interface ActivityReviewRecord {
  id: string
  parentName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ActivityCatalogRecord {
  id: string
  category: ActivityCategory
  name: string
  summary: string
  instructor: ActivityInstructorRecord
  scheduleLabel: string
  location: string
  price: ActivityPriceRecord
  spotsTotal: number
  spotsRemaining: number
  ageRequirement: string
  gradeRequirement: string
  media: ActivityMediaRecord[]
  reviews: ActivityReviewRecord[]
  averageRating: number
}

export interface ActivityPackageDealRecord {
  id: string
  label: string
  detail: string
  bonus: string
}

export interface ActivityBookingRecord {
  id: string
  childId: string
  activityId: string
  activityName: string
  status: 'confirmed' | 'waitlist' | 'cancelled'
  bookedAt: string
  sessionStartsAt: string
  cancellationDeadline: string
  paymentMode: 'pay_now' | 'invoice'
  paymentStatus: 'paid' | 'pending_invoice'
  packageDealId: string | null
  trialSession: boolean
  waitlistPosition: number | null
  confirmationCode: string | null
}

export interface ActivityProgressReportRecord {
  id: string
  weekLabel: string
  summary: string
  skillFocus: string
  nextStep: string
}

export interface ActivitySkillAssessmentRecord {
  id: string
  skill: string
  level: 'beginner' | 'developing' | 'proficient' | 'advanced'
  detail: string
}

export interface ActivityAttendanceRecord {
  id: string
  sessionLabel: string
  attended: boolean
  note: string
}

export interface ActivityTrackingRecord {
  activityId: string
  activityName: string
  weeklyReports: ActivityProgressReportRecord[]
  sessionMedia: ActivityMediaRecord[]
  skillAssessment: ActivitySkillAssessmentRecord[]
  attendance: ActivityAttendanceRecord[]
  participationCertificateUrl: string
  showcaseInfo: string
}

export interface ActivityProgramRecord {
  id: string
  kind: 'summer_camp' | 'holiday_workshop'
  title: string
  summary: string
  startsAt: string
  endsAt: string
  location: string
  scheduleLabel: string
  priceMad: number
  earlyRegistrationDiscountMad: number | null
  availableSpots: number
  ageRequirement: string
}

export interface ActivityProgramRegistrationRecord {
  id: string
  childId: string
  programId: string
  status: 'submitted' | 'under_review' | 'confirmed'
  submittedAt: string
  updatedAt: string
  seatCode: string | null
  discountAppliedMad: number | null
}

export interface ChildActivitiesRecord {
  catalog: ActivityCatalogRecord[]
  bookings: ActivityBookingRecord[]
  cancellationPolicy: string
  packageDeals: ActivityPackageDealRecord[]
  trialSessionNote: string
  tracking: ActivityTrackingRecord[]
  programs: ActivityProgramRecord[]
  programRegistrations: ActivityProgramRegistrationRecord[]
}

export interface ParentActivitiesView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  catalog: {
    items: ActivityCatalogRecord[]
    categories: ActivityCategory[]
  }
  booking: {
    bookings: ActivityBookingRecord[]
    cancellationPolicy: string
    packageDeals: ActivityPackageDealRecord[]
    trialSessionNote: string
    waitlistCount: number
  }
  tracking: {
    items: ActivityTrackingRecord[]
  }
  programs: {
    items: ActivityProgramRecord[]
    registrations: ActivityProgramRegistrationRecord[]
  }
}

export interface TransportCoordinateRecord {
  lat: number
  lng: number
}

export interface TransportLivePointRecord {
  id: string
  recordedAt: string
  position: TransportCoordinateRecord
  speedKmh: number
  etaMinutes: number
  onRoute: boolean
}

export interface TransportNotificationRecord {
  id: string
  type: 'boarded' | 'exited' | 'bus_5_min' | 'route_change' | 'geofence'
  title: string
  detail: string
  createdAt: string
}

export interface TransportRouteStopRecord {
  id: string
  label: string
  scheduledAt: string
  etaAt: string
  status: 'upcoming' | 'approaching' | 'served'
}

export interface TransportDriverRecord {
  fullName: string
  phone: string
  busNumber: string
  photoUrl: string
  licenseNumber: string
  licenseValidUntil: string
}

export interface TransportGeofenceAlertRecord {
  id: string
  createdAt: string
  detail: string
  severity: 'warning' | 'critical'
}

export interface TransportPickupPersonRecord {
  id: string
  fullName: string
  relationship: string
  temporary: boolean
  expiresAt: string | null
  qrCode: string
  photoIdLabel: string
}

export interface TransportPickupLogRecord {
  id: string
  event: 'pickup' | 'dropoff' | 'unauthorized_attempt'
  actorName: string
  authorized: boolean
  happenedAt: string
  note: string
}

export interface TransportRequestRecord {
  id: string
  type: 'service_request' | 'skip_once' | 'change_stop' | 'issue_report'
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'completed'
  detail: string
  createdAt: string
  updatedAt: string
}

export interface ChildTransportModuleRecord {
  routeName: string
  alternativeRoute: string
  livePoints: TransportLivePointRecord[]
  routeHistory: TransportLivePointRecord[]
  notifications: TransportNotificationRecord[]
  stops: TransportRouteStopRecord[]
  routeUpdates: string[]
  driver: TransportDriverRecord
  geofenceAlerts: TransportGeofenceAlertRecord[]
  parentQrCode: string
  pickupPersons: TransportPickupPersonRecord[]
  pickupLog: TransportPickupLogRecord[]
  requests: TransportRequestRecord[]
}

export interface ParentTransportView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  liveTracking: {
    routeName: string
    mapUrl: string | null
    latestPoint: TransportLivePointRecord | null
    routeHistory: TransportLivePointRecord[]
    notifications: TransportNotificationRecord[]
    geofenceAlerts: TransportGeofenceAlertRecord[]
  }
  routeInfo: {
    driver: TransportDriverRecord | null
    stops: TransportRouteStopRecord[]
    routeUpdates: string[]
    alternativeRoute: string | null
  }
  pickup: {
    parentQrCode: string | null
    persons: TransportPickupPersonRecord[]
    log: TransportPickupLogRecord[]
  }
  requests: {
    items: TransportRequestRecord[]
  }
}

export type ApprovalType =
  | 'field_trip'
  | 'photo_video'
  | 'early_dismissal'
  | 'medical_treatment'
  | 'competition_event'
  | 'alternative_pickup'
  | 'special_diet'
  | 'internet_policy'
  | 'data_sharing'
  | 'after_school_enrollment'

export interface ApprovalAttachmentRecord {
  id: string
  label: string
  kind: 'pdf' | 'image' | 'link'
  url: string
}

export interface ApprovalReminderRecord {
  id: string
  approvalId: string
  triggerHoursAfter: 24 | 48 | 72
  scheduledFor: string
  status: 'scheduled' | 'sent'
}

export interface ApprovalSignatureLogRecord {
  id: string
  approvalId: string
  action: 'signed' | 'revoked'
  actorName: string
  actedAt: string
  ipAddress: string
  deviceInfo: string
}

export interface ApprovalRequestRecord {
  id: string
  childId: string
  type: ApprovalType
  title: string
  summary: string
  detail: string
  requestedBy: string
  requestedAt: string
  updatedAt: string
  eventDate: string | null
  status: 'pending' | 'signed' | 'revoked' | 'expired'
  attachments: ApprovalAttachmentRecord[]
  pdfUrl: string
  signatureRequired: boolean
  signedAt: string | null
  signerName: string | null
  schoolConfirmation: string
  reminders: ApprovalReminderRecord[]
  canRevoke: boolean
  revokeDeadline: string | null
  revokePolicy: string
}

export interface ChildApprovalsRecord {
  items: ApprovalRequestRecord[]
  signatureLog: ApprovalSignatureLogRecord[]
  flowNote: string
  archiveNote: string
}

export interface ParentApprovalsView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  current: {
    items: ApprovalRequestRecord[]
    pendingCount: number
    signedCount: number
    reminders: ApprovalReminderRecord[]
    signatureLog: ApprovalSignatureLogRecord[]
    flowNote: string
  }
  history: {
    items: ApprovalRequestRecord[]
    archiveNote: string
  }
}

export type CommunicationRole =
  | 'class_teacher'
  | 'subject_teacher'
  | 'administration'
  | 'director'
  | 'supervisor'
  | 'psychologist'

export interface CommunicationParticipantRecord {
  id: string
  role: CommunicationRole
  fullName: string
  title: string
  averageResponseHours: number
  officeHours: string
  availabilityNote: string
}

export interface CommunicationAttachmentRecord {
  id: string
  kind: 'image' | 'file' | 'voice_note' | 'pdf' | 'video'
  label: string
  url: string
}

export interface ConversationMessageRecord {
  id: string
  sender: 'parent' | 'school'
  senderName: string
  body: string
  sentAt: string
  seenAt: string | null
  attachments: CommunicationAttachmentRecord[]
}

export interface CommunicationConversationRecord {
  id: string
  participant: CommunicationParticipantRecord
  subject: string
  archived: boolean
  lastMessagePreview: string
  messages: ConversationMessageRecord[]
}

export interface CommunicationAnnouncementRecord {
  id: string
  scope: 'school_wide' | 'class' | 'personal' | 'emergency'
  title: string
  body: string
  createdAt: string
  pinned: boolean
  read: boolean
  acknowledgedAt: string | null
  targetLabel: string
  attachments: CommunicationAttachmentRecord[]
}

export interface CommunicationAppointmentSlotRecord {
  id: string
  participantId: string
  startsAt: string
  endsAt: string
  mode: 'in_person' | 'virtual'
  available: boolean
}

export interface CommunicationAppointmentReminderRecord {
  id: string
  trigger: '1_day' | '1_hour'
  scheduledFor: string
  status: 'scheduled' | 'sent'
}

export interface CommunicationAppointmentRecord {
  id: string
  participantId: string
  participantLabel: string
  purpose: string
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
  startsAt: string
  endsAt: string
  mode: 'in_person' | 'virtual'
  meetingLink: string | null
  reminders: CommunicationAppointmentReminderRecord[]
  summary: string | null
  actionItems: string[]
  createdAt: string
  updatedAt: string
}

export interface CommunicationWhatsAppSettingsRecord {
  optIn: boolean
  invoiceReminders: boolean
  emergencyAlerts: boolean
  absenceNotifications: boolean
  busTrackingLink: boolean
  updatedAt: string
}

export interface CommunicationNotificationChannelsRecord {
  push: boolean
  email: boolean
  sms: boolean
  whatsapp: boolean
}

export interface CommunicationNotificationPreferencesRecord {
  channels: CommunicationNotificationChannelsRecord
  frequency: 'instant' | 'daily_digest' | 'weekly'
  doNotDisturbStart: string | null
  doNotDisturbEnd: string | null
  whatsapp: CommunicationWhatsAppSettingsRecord
}

export interface ChildMessagesRecord {
  conversations: CommunicationConversationRecord[]
  announcements: CommunicationAnnouncementRecord[]
  appointmentSlots: CommunicationAppointmentSlotRecord[]
  appointments: CommunicationAppointmentRecord[]
  preferences: CommunicationNotificationPreferencesRecord
}

export interface ParentMessagesView {
  role: UserRole
  roleLabel: string
  school: SchoolBrand
  linkedSchools: SchoolBrand[]
  displayName: string
  hasChildren: boolean
  activeChild: ChildRecord | null
  activeChildId: string | null
  activeChildInitials: string
  childTabs: ChildTabView[]
  devices: ViewDevice[]
  heroStats: QuickStatView[]
  messaging: {
    conversations: CommunicationConversationRecord[]
    archivedCount: number
  }
  announcements: {
    items: CommunicationAnnouncementRecord[]
    unreadCount: number
    pinnedCount: number
  }
  appointments: {
    slots: CommunicationAppointmentSlotRecord[]
    items: CommunicationAppointmentRecord[]
  }
  preferences: {
    item: CommunicationNotificationPreferencesRecord | null
  }
}

export interface RoleWorkspaceView {
  role: UserRole
  roleLabel: string
  displayName: string
  school: SchoolBrand
  title: string
  description: string
  devices: ViewDevice[]
  metrics: WorkspaceMetric[]
  priorities: string[]
}


import type {
  AlertRecord,
  BaseUserAccount,
  ChildRecord,
  DemoLoginOption,
  DeviceRecord,
  JoinInvite,
  LessonRecord,
  NavigationItem,
  ParentAccount,
  QuickActionModule,
  SchoolBrand,
  SeedUser,
  WorkspaceSummary
} from './types.ts'
import { USER_ROLES } from './types.ts'
import { childAcademicsById } from './academics.ts'

export { USER_ROLES } from './types.ts'

export const APP_NAME = 'School OS'

export const ROLE_LABELS: Record<(typeof USER_ROLES)[keyof typeof USER_ROLES], string> = {
  [USER_ROLES.superAdmin]: 'Super Admin',
  [USER_ROLES.schoolAdmin]: 'School Admin',
  [USER_ROLES.teacher]: 'Teacher',
  [USER_ROLES.parent]: 'Parent',
  [USER_ROLES.transportDriver]: 'Transport Driver',
  [USER_ROLES.supervisor]: 'Supervisor'
}

export const APP_ROUTES = {
  login: '/login',
  join: '/join',
  onboarding: '/onboarding',
  superAdminOverview: '/super-admin/overview',
  schoolAdminOverview: '/school-admin/overview',
  teacherOverview: '/teacher/overview',
  parentDashboard: '/parent/dashboard',
  academics: '/parent/academics',
  contracts: '/parent/contracts',
  fees: '/parent/fees',
  activities: '/parent/activities',
  transport: '/parent/transport',
  approvals: '/parent/approvals',
  afterSchool: '/parent/after-school',
  messages: '/parent/messages',
  driverOverview: '/transport-driver/overview',
  supervisorOverview: '/supervisor/overview'
} as const

export const ROLE_DEFAULT_ROUTES = {
  [USER_ROLES.superAdmin]: APP_ROUTES.superAdminOverview,
  [USER_ROLES.schoolAdmin]: APP_ROUTES.schoolAdminOverview,
  [USER_ROLES.teacher]: APP_ROUTES.teacherOverview,
  [USER_ROLES.parent]: APP_ROUTES.parentDashboard,
  [USER_ROLES.transportDriver]: APP_ROUTES.driverOverview,
  [USER_ROLES.supervisor]: APP_ROUTES.supervisorOverview
} as const

export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000

export const navigationByRole: Record<(typeof USER_ROLES)[keyof typeof USER_ROLES], NavigationItem[]> = {
  [USER_ROLES.superAdmin]: [{ label: 'Overview', route: APP_ROUTES.superAdminOverview, description: 'Platform-wide control' }],
  [USER_ROLES.schoolAdmin]: [{ label: 'Overview', route: APP_ROUTES.schoolAdminOverview, description: 'School operations' }],
  [USER_ROLES.teacher]: [{ label: 'Overview', route: APP_ROUTES.teacherOverview, description: 'Classroom pulse' }],
  [USER_ROLES.parent]: [
    { label: 'Dashboard', route: APP_ROUTES.parentDashboard, description: 'Today at a glance' },
    { label: 'Academics', route: APP_ROUTES.academics, description: 'Timetable, grades, homework, exams, attendance' },
    { label: 'Contracts', route: APP_ROUTES.contracts, description: 'Current contract, signatures, re-enrollment, and alerts' },
    { label: 'Fees', route: APP_ROUTES.fees, description: 'Fee structure, payments, and tax documents' },
    { label: 'Activities', route: APP_ROUTES.activities, description: 'Catalog, booking, tracking, and seasonal programs' },
    { label: 'Transport', route: APP_ROUTES.transport, description: 'Live tracking, secure pickup, and transport requests' },
    { label: 'Approvals', route: APP_ROUTES.approvals, description: 'Permissions, digital signatures, reminders, and approval history' },
    { label: 'After-school', route: APP_ROUTES.afterSchool, description: 'Included in Activities module' },
    { label: 'Messages', route: APP_ROUTES.messages, description: 'Direct messaging, announcements, meetings, WhatsApp, and notification controls' }
  ],
  [USER_ROLES.transportDriver]: [{ label: 'Overview', route: APP_ROUTES.driverOverview, description: 'Assigned routes' }],
  [USER_ROLES.supervisor]: [{ label: 'Overview', route: APP_ROUTES.supervisorOverview, description: 'Daily supervision' }]
}

export const quickActionModules: QuickActionModule[] = [
  { title: 'Contracts', body: 'Review signed agreements and renewal milestones.', route: APP_ROUTES.contracts },
  { title: 'Fee transparency', body: 'Track paid, upcoming, and exceptional charges.', route: APP_ROUTES.fees },
  { title: 'Activities', body: 'See clubs, trips, and event participation in one place.', route: APP_ROUTES.activities },
  { title: 'Transport', body: 'Watch route readiness and pickup confirmations.', route: APP_ROUTES.transport },
  { title: 'Approvals', body: 'Approve forms, outings, and important requests quickly.', route: APP_ROUTES.approvals },
  { title: 'After-school', body: 'Reserve premium care and enrichment sessions.', route: APP_ROUTES.afterSchool },
  { title: 'VIP communication', body: 'Reach the school with prioritized parent messaging.', route: APP_ROUTES.messages }
]

export const schoolBrand: SchoolBrand = { id: 'school-summit', code: 'SUMMIT', name: 'Summit Private Academy', campus: 'Rabat Riverside Campus', supportEmail: 'concierge@summitacademy.test', accent: 'Gold', greeting: "A calm overview of your child's school day" }
export const secondSchoolBrand: SchoolBrand = { id: 'school-atlas', code: 'ATLAS', name: 'Atlas International School', campus: 'Hay Riad Campus', supportEmail: 'care@atlas-school.test', accent: 'Blue', greeting: 'A clear view across every linked school experience' }
export const platformBrand: SchoolBrand = { id: 'platform-school-os', code: 'PLATFORM', name: 'School OS Platform', campus: 'Multi-school SaaS control layer', supportEmail: 'owner@schoolos.test', accent: 'Gold', greeting: 'Platform operations across all partner schools' }

function device(id: string, name: string, location: string, lastActiveAt: string, trusted = true): DeviceRecord { return { id, name, location, lastActiveAt, trusted } }
function lesson(time: string, subject: string): LessonRecord { return { time, subject } }
function alert(id: string, tone: AlertRecord['tone'], title: string, detail: string): AlertRecord { return { id, tone, title, detail } }
function child(payload: ChildRecord): ChildRecord { return payload }

function baseUser<TRole extends SeedUser['role']>(payload: { id: string; role: TRole; school: SchoolBrand; schoolCode: string; email: string; password: string; accessCode: string; inviteCode?: string; displayName: string; recovery: BaseUserAccount['recovery']; biometricEnabled?: boolean; needsOnboarding?: boolean; linkedSchools?: SchoolBrand[]; knownDevices?: DeviceRecord[]; workspaceSummary?: WorkspaceSummary }): BaseUserAccount & { role: TRole } {
  return { id: payload.id, role: payload.role, school: payload.school, linkedSchools: payload.linkedSchools ?? [payload.school], credentials: { schoolCode: payload.schoolCode, email: payload.email, password: payload.password, accessCode: payload.accessCode, inviteCode: payload.inviteCode }, profile: { displayName: payload.displayName }, recovery: payload.recovery, biometricEnabled: payload.biometricEnabled ?? false, needsOnboarding: payload.needsOnboarding ?? false, knownDevices: payload.knownDevices ?? [], workspaceSummary: payload.workspaceSummary }
}

const platformAdmin = { ...baseUser({ id: 'super-admin-wail', role: USER_ROLES.superAdmin, school: platformBrand, schoolCode: 'PLATFORM', email: 'owner@schoolos.test', password: 'Welcome123!', accessCode: 'PLATFORM-OWNER-9001', displayName: 'Wail Sebbar', recovery: { sms: '+212600000001', whatsapp: '+212600000001' }, biometricEnabled: true, knownDevices: [device('device-platform-1', 'MacBook Pro', 'Casablanca', '2026-03-11T00:40:00.000Z')], workspaceSummary: { title: 'Portfolio oversight', description: 'Monitor partner schools, subscriptions, onboarding quality, and escalations from one layer.', metrics: [{ label: 'Partner schools', value: '12', detail: 'Active campuses on the platform' }, { label: 'Health score', value: '96%', detail: 'Service uptime and support resolution' }, { label: 'Open escalations', value: '3', detail: 'High-priority platform cases' }], priorities: ['Review onboarding readiness for two new premium schools.', 'Validate subscription renewals due this week.', 'Track support response quality across all tenants.'] } }) }
const schoolAdmin = { ...baseUser({ id: 'school-admin-sara', role: USER_ROLES.schoolAdmin, school: schoolBrand, schoolCode: 'SUMMIT', email: 'admin@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-ADMIN-4401', displayName: 'Sara El Idrissi', recovery: { sms: '+212600000002', whatsapp: '+212600000002' }, biometricEnabled: true, knownDevices: [device('device-admin-1', 'Office Surface', 'Rabat', '2026-03-11T00:15:00.000Z')], workspaceSummary: { title: 'School operations hub', description: 'Coordinate admissions, parent service, classes, payments, and service quality for the school.', metrics: [{ label: 'Active families', value: '428', detail: 'Parents with active accounts' }, { label: 'Open approvals', value: '14', detail: 'Waiting for school-side validation' }, { label: 'Fee follow-ups', value: '9', detail: 'Families needing billing contact' }], priorities: ["Validate next week's activities communication.", 'Review unresolved parent complaints before Friday.', 'Confirm transport roster changes for Route North.'] } }) }
const teacher = { ...baseUser({ id: 'teacher-amine', role: USER_ROLES.teacher, school: schoolBrand, schoolCode: 'SUMMIT', email: 'amine.teacher@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-TEACH-3301', displayName: 'Amine Jalal', recovery: { sms: '+212600000003', whatsapp: '+212600000003' }, knownDevices: [device('device-teacher-1', 'Teacher iPad', 'Rabat', '2026-03-10T21:40:00.000Z')], workspaceSummary: { title: 'Classroom pulse', description: 'Take attendance, publish updates, and keep the parent experience informed with the right signals.', metrics: [{ label: 'Classes today', value: '5', detail: 'Scheduled teaching blocks' }, { label: 'Attendance pending', value: '1', detail: 'Class register awaiting confirmation' }, { label: 'Parent updates', value: '7', detail: 'Weekly notes ready to publish' }], priorities: ['Post Grade 4 weekly learning highlights.', 'Resolve two missing attendance entries.', 'Prepare parent evening notes for Friday.'] } }) }

const parentAccounts: ParentAccount[] = [
  {
    ...baseUser({ id: 'parent-amira', role: USER_ROLES.parent, school: schoolBrand, schoolCode: 'SUMMIT', email: 'amira.bennani@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-FAMILY-1101', inviteCode: 'QR-SUMMIT-AMIRA-2026', displayName: 'Amira Bennani', recovery: { sms: '+212600000010', whatsapp: '+212600000010' }, biometricEnabled: true, needsOnboarding: true, linkedSchools: [schoolBrand, secondSchoolBrand], knownDevices: [device('device-amira-1', 'iPhone 15', 'Rabat', '2026-03-10T22:10:00.000Z'), device('device-amira-2', 'iPad Air', 'Rabat', '2026-03-08T19:20:00.000Z')] }),
    children: [child({ id: 'student-lina', fullName: 'Lina Bennani', gradeLabel: 'Grade 4', classLabel: 'Cedar Class', attendanceSummary: '96% attendance this month', latestHighlight: 'Finished her science fair prototype ahead of schedule.', statusTone: 'Excellent momentum', school: schoolBrand, averageScore: '15.2/20', averageLabel: 'Steady upward trend in maths and writing.', attendanceRate: '96%', behaviorRating: 4, behaviorLabel: 'Calm, engaged, and collaborative in class.', alerts: [alert('lina-invoice', 'warning', 'March invoice unpaid', 'Finance office is waiting for the final transfer confirmation.'), alert('lina-permission', 'warning', 'Field trip permission awaiting signature', 'Sign the museum visit authorization before 18:00 today.'), alert('lina-meeting', 'info', 'Parent-teacher meeting tomorrow at 10:00 AM', 'Your meeting slot with Ms. Zohra is confirmed.'), alert('lina-homework', 'info', 'New homework assigned in Math', 'Fractions worksheet and revision quiz are now available.')], schedule: [lesson('08:00', 'Math'), lesson('10:00', 'French'), lesson('14:00', 'Sports')], transport: { status: 'Bus arriving at 08:15', detail: '3 min away from the pickup point', tone: 'live' }, news: 'Registration for robotics club is now open.', achievement: 'Earned the Star Student badge this week for focus and teamwork.', academics: childAcademicsById['student-lina'] }), child({ id: 'student-yanis', fullName: 'Yanis Bennani', gradeLabel: 'Grade 1', classLabel: 'Olive Class', attendanceSummary: '98% attendance this month', latestHighlight: 'Joined the spring reading circle and loved his first session.', statusTone: 'Settled and thriving', school: schoolBrand, averageScore: '14.4/20', averageLabel: 'Strong language growth and class participation.', attendanceRate: '98%', behaviorRating: 5, behaviorLabel: 'Very positive behavior with classmates and teachers.', alerts: [alert('yanis-story', 'info', 'Reading folder ready for review', 'Please read tonight\'s story and sign the reading log.'), alert('yanis-art', 'info', 'Art materials reminder', 'Bring a small apron for tomorrow\'s watercolor workshop.')], schedule: [lesson('08:30', 'Reading'), lesson('10:15', 'Art'), lesson('13:30', 'Play & Movement')], transport: { status: 'Driver checked in', detail: 'Morning route confirmed for pickup.', tone: 'confirmed' }, news: 'Spring storytelling week starts next Monday.', achievement: 'Completed his first full reading log independently.', academics: childAcademicsById['student-yanis'] }), child({ id: 'student-adam', fullName: 'Adam Bennani', gradeLabel: 'Year 2', classLabel: 'Maple Class', attendanceSummary: '95% attendance this month', latestHighlight: 'Settled into his new campus and met his support teacher.', statusTone: 'New campus transition', school: secondSchoolBrand, averageScore: '13.8/20', averageLabel: 'Good transition week with solid classroom confidence.', attendanceRate: '95%', behaviorRating: 4, behaviorLabel: 'Adapting well and participating with reassurance.', alerts: [alert('adam-orientation', 'warning', 'Campus orientation form pending', 'Complete the first-week orientation checklist from Atlas campus.'), alert('adam-club', 'info', 'After-school music trial available', 'Reserve Adam\'s trial slot before Friday noon.')], schedule: [lesson('09:00', 'English'), lesson('11:00', 'Science'), lesson('15:00', 'Music')], transport: { status: 'Transport not yet assigned', detail: 'Atlas campus is still confirming route availability.', tone: 'pending' }, news: 'Atlas campus opened registration for the welcome robotics lab.', achievement: 'Received a welcome ribbon for confidence during his first week.', academics: childAcademicsById['student-adam'] })],
    dashboardSummary: { attendanceRate: '97%', fees: { paidLabel: 'MAD 14,000 paid', dueLabel: 'MAD 2,500 due on March 28' }, upcomingEvents: 4, transportStatus: 'Morning pickup confirmed', latestStatus: 'Three linked children across two schools checked in successfully today.' },
    complaints: [{ id: 'complaint-101', title: 'Cafeteria allergy reminder', status: 'In progress', openedAt: 'March 9', summary: 'The school nurse is updating lunch labels for Lina\'s nut-free meal plan.' }],
    recentUpdates: [{ id: 'update-1', title: 'Parent evening schedule released', body: 'Meeting slots for Grade 4 and Grade 1 are now open for booking this Friday.' }, { id: 'update-2', title: 'Atlas campus welcome note', body: 'Adam\'s new campus shared a transition checklist and welcome schedule for families.' }]
  },
  {
    ...baseUser({ id: 'parent-samir', role: USER_ROLES.parent, school: schoolBrand, schoolCode: 'SUMMIT', email: 'samir.elmansouri@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-FAMILY-1102', inviteCode: 'QR-SUMMIT-SAMIR-2026', displayName: 'Samir El Mansouri', recovery: { sms: '+212600000011', whatsapp: '+212600000011' }, biometricEnabled: true, knownDevices: [device('device-samir-1', 'Galaxy S24', 'Rabat', '2026-03-11T00:20:00.000Z')] }),
    children: [child({ id: 'student-salma', fullName: 'Salma El Mansouri', gradeLabel: 'Grade 6', classLabel: 'Atlas Class', attendanceSummary: '100% attendance this month', latestHighlight: 'Selected for the debate team finals.', statusTone: 'Strong academic focus', school: schoolBrand, averageScore: '17.1/20', averageLabel: 'Excellent consistency across languages and science.', attendanceRate: '100%', behaviorRating: 5, behaviorLabel: 'Independent, respectful, and highly dependable.', alerts: [alert('salma-meeting', 'info', 'Parent-teacher meeting tomorrow at 10:00 AM', 'Science lead requested a short progress check-in.'), alert('salma-debate', 'info', 'Debate final rehearsal today', 'Pickup may shift by 20 minutes after the rehearsal ends.')], schedule: [lesson('08:00', 'Science'), lesson('10:00', 'French'), lesson('14:00', 'Debate Club')], transport: { status: 'Transport not assigned', detail: 'No route is active for Salma at the moment.', tone: 'pending' }, news: 'Registration for the spring leadership seminar is now open.', achievement: 'Qualified for the debate team finals with the highest score in her cohort.', academics: childAcademicsById['student-salma'] })],
    dashboardSummary: { attendanceRate: '100%', fees: { paidLabel: 'All fees paid', dueLabel: 'No balance outstanding' }, upcomingEvents: 1, transportStatus: 'Transport not assigned', latestStatus: 'Salma\'s weekly learning report is ready.' }, complaints: [], recentUpdates: [{ id: 'update-3', title: 'Weekly learning report published', body: 'A fresh summary from Salma\'s teachers is available for review.' }]
  },
  {
    ...baseUser({ id: 'parent-nora', role: USER_ROLES.parent, school: schoolBrand, schoolCode: 'SUMMIT', email: 'nora.alaoui@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-FAMILY-1103', inviteCode: 'QR-SUMMIT-NORA-2026', displayName: 'Nora Alaoui', recovery: { sms: '+212600000012', whatsapp: '+212600000012' }, needsOnboarding: true, knownDevices: [] }),
    children: [],
    dashboardSummary: { attendanceRate: null, fees: { paidLabel: 'Awaiting first invoice', dueLabel: null }, upcomingEvents: 0, transportStatus: null, latestStatus: null }, complaints: [], recentUpdates: []
  }
]

const transportDriver = { ...baseUser({ id: 'driver-rashid', role: USER_ROLES.transportDriver, school: schoolBrand, schoolCode: 'SUMMIT', email: 'driver.rashid@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-ROUTE-2201', displayName: 'Rashid Naciri', recovery: { sms: '+212600000004', whatsapp: '+212600000004' }, knownDevices: [device('device-driver-1', 'Android Route Phone', 'Rabat', '2026-03-10T23:55:00.000Z')], workspaceSummary: { title: 'Route readiness', description: 'Track assigned students, route timing, and pickup confirmations for transport operations.', metrics: [{ label: 'Routes today', value: '2', detail: 'Morning and afternoon coverage' }, { label: 'Students assigned', value: '31', detail: 'Children on current route sheet' }, { label: 'Exceptions', value: '1', detail: 'Pickup note requiring confirmation' }], priorities: ['Confirm updated pickup time for one family.', 'Review afternoon traffic delay contingency.', 'Mark completion status after final drop-off.'] } }) }
const supervisor = { ...baseUser({ id: 'supervisor-hind', role: USER_ROLES.supervisor, school: schoolBrand, schoolCode: 'SUMMIT', email: 'supervisor.hind@summitacademy.test', password: 'Welcome123!', accessCode: 'SUMMIT-SAFE-5501', displayName: 'Hind Ouhammou', recovery: { sms: '+212600000005', whatsapp: '+212600000005' }, knownDevices: [device('device-supervisor-1', 'Gate Tablet', 'Rabat', '2026-03-10T18:05:00.000Z')], workspaceSummary: { title: 'Supervision and student safety', description: 'Watch student movement, dismissal flow, and incident follow-up across the campus day.', metrics: [{ label: 'Zones covered', value: '4', detail: 'Playground, gate, cafeteria, corridor' }, { label: 'Dismissal flags', value: '2', detail: 'Pickup notes needing attention' }, { label: 'Incident logs', value: '0', detail: 'No major incidents today' }], priorities: ['Review dismissal list before afternoon release.', 'Confirm cafeteria supervision rotation.', 'Close yesterday\'s minor behavior follow-up.'] } }) }

export const seedUsers: SeedUser[] = [platformAdmin, schoolAdmin, teacher, ...parentAccounts, transportDriver, supervisor]
export const seedParentAccounts = parentAccounts
export const joinInvites: JoinInvite[] = parentAccounts.map((account) => ({ inviteCode: account.credentials.inviteCode || '', accountId: account.id, schoolName: account.school.name, title: `${account.profile.displayName} family invite`, linkedChildren: account.children.map((item) => item.fullName), linkedSchools: account.linkedSchools.map((item) => item.name) }))
export const demoLoginOptions: DemoLoginOption[] = seedUsers.map((account) => ({ label: account.profile.displayName, role: account.role, roleLabel: ROLE_LABELS[account.role], schoolCode: account.credentials.schoolCode, email: account.credentials.email, password: account.credentials.password, accessCode: account.credentials.accessCode, biometricEnabled: account.biometricEnabled, summary: account.role === USER_ROLES.parent ? `${(account as ParentAccount).children.length > 0 ? `${(account as ParentAccount).children.length} linked ${(account as ParentAccount).children.length === 1 ? 'child' : 'children'}` : 'No child linked yet'}` : account.workspaceSummary?.title || 'Workspace ready' }))




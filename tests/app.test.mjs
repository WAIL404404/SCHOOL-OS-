import assert from 'node:assert/strict'
import { APP_ROUTES, seedParentAccounts, seedUsers } from '../shared/app/data.ts'
import { buildParentAcademicsView, buildParentActivitiesView, buildParentContractsView, buildParentDashboardView, buildParentFinancialView } from '../shared/app/view-models.ts'
import { credentialLoginSchema } from '../shared/app/validation.ts'
import { loginUser, resolveRoute } from '../shared/app/session.ts'

class MemoryStorage {
  constructor() {
    this.map = new Map()
  }

  clear() {
    this.map.clear()
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null
  }

  key(index) {
    return Array.from(this.map.keys())[index] ?? null
  }

  removeItem(key) {
    this.map.delete(key)
  }

  setItem(key, value) {
    this.map.set(key, String(value))
  }

  get length() {
    return this.map.size
  }
}

function runTest(name, fn) {
  try {
    fn()
  } catch (error) {
    throw new Error(`${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

runTest('login redirects parent to dashboard', () => {
  const storage = new MemoryStorage()
  const result = loginUser(
    {
      schoolCode: 'SUMMIT',
      email: 'samir.elmansouri@summitacademy.test',
      password: 'Welcome123!'
    },
    storage,
    seedUsers,
    { userAgent: 'Windows Browser' }
  )

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.redirectTo, APP_ROUTES.parentDashboard)
    assert.equal(result.session.role, 'parent')
  }
})

runTest('protected parent dashboard redirects correctly', () => {
  assert.equal(resolveRoute(APP_ROUTES.parentDashboard, null), APP_ROUTES.login)

  const storage = new MemoryStorage()
  const schoolAdminResult = loginUser(
    {
      schoolCode: 'SUMMIT',
      email: 'admin@summitacademy.test',
      password: 'Welcome123!'
    },
    storage,
    seedUsers,
    { userAgent: 'Windows Browser' }
  )

  assert.equal(schoolAdminResult.ok, true)
  if (schoolAdminResult.ok) {
    assert.equal(resolveRoute(APP_ROUTES.parentDashboard, schoolAdminResult.session, storage, seedUsers), APP_ROUTES.schoolAdminOverview)
  }
})

runTest('dashboard view renders linked child data', () => {
  const account = seedParentAccounts[0]
  const view = buildParentDashboardView(account, 'student-lina', new MemoryStorage())

  assert.equal(view.activeChild?.fullName, 'Lina Bennani')
  assert.equal(view.quickStats[0].value, '15.2/20')
  assert.equal(view.alerts.length, 4)
  assert.equal(view.childTabs.length, 3)
  assert.match(view.transport.status, /08:15/)
})

runTest('academics view exposes schedule, homework, and report card details', () => {
  const account = seedParentAccounts[0]
  const view = buildParentAcademicsView(account, 'student-lina', new MemoryStorage())

  assert.equal(view.activeChild?.fullName, 'Lina Bennani')
  assert.equal(view.schedule.days.length, 5)
  assert.equal(view.grades.reportCard?.termId, 't2')
  assert.match(view.grades.reportCard?.downloadUrl ?? '', /child=student-lina/)
  assert.equal(view.homework.summary.pending, 1)
  assert.equal(view.homework.summary.late, 1)
  assert.equal(view.attendance.badge.label, 'Present today')
})

runTest('academics view respects ranking toggle and attendance flags', () => {
  const account = seedParentAccounts[0]
  const view = buildParentAcademicsView(account, 'student-adam', new MemoryStorage())

  assert.equal(view.grades.rankingEnabled, false)
  assert.equal(view.attendance.badge.label, 'Late today')
  assert.match(view.attendance.impact, /attendance impact tracking enabled/i)
  assert.match(view.exams.items[1]?.retake ?? '', /March 23/)
})

runTest('dashboard empty states stay stable', () => {
  const account = seedParentAccounts[2]
  const view = buildParentDashboardView(account, null, new MemoryStorage())

  assert.equal(view.hasChildren, false)
  assert.equal(view.complaintState.empty, true)
  assert.equal(view.quickStats[0].value, 'Unavailable')
  assert.equal(view.recentUpdates[0].title, 'No notices yet')
})

runTest('academics empty states stay stable', () => {
  const account = seedParentAccounts[2]
  const view = buildParentAcademicsView(account, null, new MemoryStorage())

  assert.equal(view.hasChildren, false)
  assert.equal(view.heroStats[0].value, 'Unavailable')
  assert.equal(view.schedule.days.length, 0)
  assert.equal(view.schedule.updates[0]?.title, 'No live timetable changes')
  assert.equal(view.attendance.badge.label, 'Attendance pending')
})

runTest('financial view exposes fee structure and payment tracking', () => {
  const account = seedParentAccounts[0]
  const view = buildParentFinancialView(account, 'student-lina', new MemoryStorage())

  assert.equal(view.activeChild?.fullName, 'Lina Bennani')
  assert.equal(view.fees.items.length, 8)
  assert.equal(view.paymentTracking.monthlyStatus.length > 0, true)
  assert.equal(view.paymentTracking.history.length > 0, true)
  assert.equal(view.onlinePayment.gateways.length, 3)
  assert.equal(view.taxDocuments.items.length > 0, true)
})

runTest('financial view empty states stay stable', () => {
  const account = seedParentAccounts[2]
  const view = buildParentFinancialView(account, null, new MemoryStorage())

  assert.equal(view.hasChildren, false)
  assert.equal(view.heroStats[0].value, 'Unavailable')
  assert.equal(view.fees.items.length, 0)
  assert.equal(view.paymentTracking.history.length, 0)
  assert.equal(view.requests.items.length, 0)
})

runTest('contracts view exposes current contract and signature states', () => {
  const account = seedParentAccounts[0]
  const view = buildParentContractsView(account, 'student-lina', new MemoryStorage())

  assert.equal(view.activeChild?.fullName, 'Lina Bennani')
  assert.match(view.currentContract?.contractRef ?? '', /CNT-LINA/)
  assert.equal(view.digitalSignature.signers.length, 2)
  assert.equal(view.history.items.length > 0, true)
  assert.equal(view.alerts.items.length > 0, true)
})

runTest('contracts view empty states stay stable', () => {
  const account = seedParentAccounts[2]
  const view = buildParentContractsView(account, null, new MemoryStorage())

  assert.equal(view.hasChildren, false)
  assert.equal(view.heroStats[0].value, 'Unavailable')
  assert.equal(view.currentContract, null)
  assert.equal(view.digitalSignature.signers.length, 0)
})

runTest('activities view exposes catalog and booking modules', () => {
  const account = seedParentAccounts[0]
  const view = buildParentActivitiesView(account, 'student-lina', new MemoryStorage())

  assert.equal(view.activeChild?.fullName, 'Lina Bennani')
  assert.equal(view.catalog.items.length > 0, true)
  assert.equal(view.booking.bookings.length > 0, true)
  assert.equal(view.programs.items.length > 0, true)
})

runTest('activities view empty states stay stable', () => {
  const account = seedParentAccounts[2]
  const view = buildParentActivitiesView(account, null, new MemoryStorage())

  assert.equal(view.hasChildren, false)
  assert.equal(view.heroStats[0].value, 'Unavailable')
  assert.equal(view.catalog.items.length, 0)
  assert.equal(view.booking.bookings.length, 0)
})

runTest('credential schema accepts current login shape', () => {
  const parsed = credentialLoginSchema.safeParse({
    schoolCode: 'SUMMIT',
    email: 'amira.bennani@summitacademy.test',
    password: 'Welcome123!'
  })

  assert.equal(parsed.success, true)
})




<script setup lang="ts">
import { motion } from 'motion-v'
import type { ActivityBookingRecord, ActivityCatalogRecord, ActivityProgramRecord, ActivityProgramRegistrationRecord, ParentActivitiesView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentActivitiesView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const selectedActivityId = ref('')
const bookingPaymentMode = ref<'pay_now' | 'invoice'>('pay_now')
const selectedPackageDeal = ref('')
const trialSession = ref(false)

const selectedProgramId = ref('')
const applyEarlyDiscount = ref(true)

const bookingFeedback = ref('')
const bookingFeedbackTone = ref<'success' | 'error'>('success')
const bookingLoading = ref(false)

const programFeedback = ref('')
const programFeedbackTone = ref<'success' | 'error'>('success')
const programLoading = ref(false)

const liveCatalog = ref<ActivityCatalogRecord[]>([])
const liveBookings = ref<ActivityBookingRecord[]>([])
const livePrograms = ref<ActivityProgramRecord[]>([])
const liveRegistrations = ref<ActivityProgramRegistrationRecord[]>([])
const activitiesFeedLoading = ref(false)
const activitiesFeedError = ref('')

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    bookingFeedback.value = ''
    programFeedback.value = ''
    activitiesFeedError.value = ''
    selectedPackageDeal.value = ''
    trialSession.value = false
    void refreshActivitiesFeed(childId)
  },
  { immediate: true }
)

const catalogItems = computed(() => (liveCatalog.value.length ? liveCatalog.value : props.viewModel.catalog.items))
const bookingItems = computed(() => (liveBookings.value.length ? liveBookings.value : props.viewModel.booking.bookings))
const programItems = computed(() => (livePrograms.value.length ? livePrograms.value : props.viewModel.programs.items))
const programRegistrations = computed(() => (liveRegistrations.value.length ? liveRegistrations.value : props.viewModel.programs.registrations))

watch(
  catalogItems,
  (items) => {
    const first = items[0]
    if (first && !selectedActivityId.value) selectedActivityId.value = first.id
  },
  { immediate: true }
)

watch(
  programItems,
  (items) => {
    const first = items[0]
    if (first && !selectedProgramId.value) selectedProgramId.value = first.id
  },
  { immediate: true }
)

function formatMad(amount: number | null) {
  if (amount === null) return 'N/A'
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

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

function bookingStatusClass(status: ActivityBookingRecord['status']) {
  if (status === 'confirmed') return 'status-pill'
  if (status === 'waitlist') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--alert'
}

function bookingStatusLabel(status: ActivityBookingRecord['status']) {
  if (status === 'waitlist') return 'Waitlist'
  if (status === 'cancelled') return 'Cancelled'
  return 'Confirmed'
}

function registrationStatusClass(status: ActivityProgramRegistrationRecord['status']) {
  if (status === 'confirmed') return 'status-pill'
  if (status === 'under_review') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function ratingStars(rating: number) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)))
  return `${safe}/5`
}

async function refreshActivitiesFeed(childId: string | null) {
  if (!childId) {
    liveCatalog.value = []
    liveBookings.value = []
    livePrograms.value = []
    liveRegistrations.value = []
    return
  }

  activitiesFeedLoading.value = true
  activitiesFeedError.value = ''
  try {
    const [bookingsPayload, programsPayload] = await Promise.all([
      $fetch<{ catalog: ActivityCatalogRecord[]; bookings: ActivityBookingRecord[] }>('/api/parent/activities/bookings', { query: { child: childId } }),
      $fetch<{ items: ActivityProgramRecord[]; registrations: ActivityProgramRegistrationRecord[] }>('/api/parent/activities/programs', { query: { child: childId } })
    ])
    liveCatalog.value = bookingsPayload.catalog
    liveBookings.value = bookingsPayload.bookings
    livePrograms.value = programsPayload.items
    liveRegistrations.value = programsPayload.registrations
  } catch {
    activitiesFeedError.value = 'Live activities data could not be refreshed. Showing seeded records.'
    liveCatalog.value = []
    liveBookings.value = []
    livePrograms.value = []
    liveRegistrations.value = []
  } finally {
    activitiesFeedLoading.value = false
  }
}

async function submitBooking() {
  const childId = props.viewModel.activeChildId
  if (!childId) {
    bookingFeedbackTone.value = 'error'
    bookingFeedback.value = 'No linked child selected.'
    return
  }
  if (!selectedActivityId.value) {
    bookingFeedbackTone.value = 'error'
    bookingFeedback.value = 'Select an activity before booking.'
    return
  }

  bookingLoading.value = true
  bookingFeedback.value = ''
  try {
    const payload = await $fetch<{
      message: string
      catalog: ActivityCatalogRecord[]
      bookings: ActivityBookingRecord[]
    }>('/api/parent/activities/bookings', {
      method: 'POST',
      body: {
        action: 'book',
        childId,
        activityId: selectedActivityId.value,
        paymentMode: bookingPaymentMode.value,
        packageDealId: selectedPackageDeal.value || null,
        trialSession: trialSession.value
      }
    })

    liveCatalog.value = payload.catalog
    liveBookings.value = payload.bookings
    bookingFeedbackTone.value = 'success'
    bookingFeedback.value = payload.message
  } catch {
    bookingFeedbackTone.value = 'error'
    bookingFeedback.value = 'Booking request failed. Please try again.'
  } finally {
    bookingLoading.value = false
  }
}

async function cancelBooking(bookingId: string) {
  const childId = props.viewModel.activeChildId
  if (!childId) return

  bookingLoading.value = true
  bookingFeedback.value = ''
  try {
    const payload = await $fetch<{
      message: string
      catalog: ActivityCatalogRecord[]
      bookings: ActivityBookingRecord[]
    }>('/api/parent/activities/bookings', {
      method: 'POST',
      body: {
        action: 'cancel',
        childId,
        bookingId
      }
    })

    liveCatalog.value = payload.catalog
    liveBookings.value = payload.bookings
    bookingFeedbackTone.value = 'success'
    bookingFeedback.value = payload.message
  } catch {
    bookingFeedbackTone.value = 'error'
    bookingFeedback.value = 'Cancellation failed. Check the 24h policy and try again.'
  } finally {
    bookingLoading.value = false
  }
}

async function submitProgramRegistration() {
  const childId = props.viewModel.activeChildId
  if (!childId || !selectedProgramId.value) {
    programFeedbackTone.value = 'error'
    programFeedback.value = 'Select a program before registering.'
    return
  }

  programLoading.value = true
  programFeedback.value = ''
  try {
    const payload = await $fetch<{
      message: string
      items: ActivityProgramRecord[]
      registrations: ActivityProgramRegistrationRecord[]
    }>('/api/parent/activities/programs', {
      method: 'POST',
      body: {
        childId,
        programId: selectedProgramId.value,
        applyEarlyDiscount: applyEarlyDiscount.value
      }
    })

    livePrograms.value = payload.items
    liveRegistrations.value = payload.registrations
    programFeedbackTone.value = 'success'
    programFeedback.value = payload.message
  } catch {
    programFeedbackTone.value = 'error'
    programFeedback.value = 'Program registration failed. Please try again.'
  } finally {
    programLoading.value = false
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
          <p class="eyebrow">Activities and after-school booking</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ catalogItems.length }} activities</span>
            <span>{{ bookingItems.filter((item) => item.status === 'confirmed').length }} confirmed bookings</span>
            <span>{{ bookingItems.filter((item) => item.status === 'waitlist').length }} waitlist</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ props.viewModel.booking.trialSessionNote }}</p>
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
                <small>{{ child.gradeLabel }} · {{ child.schoolName }}</small>
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="hero-summary hero-summary--single">
          <article class="hero-summary__card">
            <p class="eyebrow">Activities and after-school booking</p>
            <h3>No activity profile linked yet</h3>
            <p>Once a child profile is linked, activity catalog, booking, progress tracking, and seasonal programs will appear here.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Activity pulse</h2>
        <p>Catalog availability, booking status, and program readiness are tracked in one place.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="activitiesFeedError" class="form-message form-message--error">{{ activitiesFeedError }}</p>
      <p v-else-if="activitiesFeedLoading" class="module-note">Refreshing activity availability and bookings...</p>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">6.1 Activity catalog</p>
        <h2>Categories, instructors, schedule, media, and reviews</h2>
        <p>Parents can browse sports, arts, tech, languages, and tutoring options with full details.</p>
      </div>
      <div class="pill-row">
        <span v-for="category in props.viewModel.catalog.categories" :key="category" class="status-pill status-pill--neutral">{{ category }}</span>
      </div>
      <div class="subject-grid" style="margin-top: 16px;">
        <article v-for="item in catalogItems" :key="item.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ item.category }}</p>
              <h3>{{ item.name }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ ratingStars(item.averageRating) }} {{ item.averageRating.toFixed(1) }}</span>
          </div>
          <p>{{ item.summary }}</p>
          <p><strong>Instructor:</strong> {{ item.instructor.fullName }} · {{ item.instructor.title }}</p>
          <p>{{ item.instructor.bio }}</p>
          <ul class="plain-list plain-list--tight">
            <li v-for="qualification in item.instructor.qualifications" :key="qualification">{{ qualification }}</li>
          </ul>
          <div class="summary-strip summary-strip--muted">
            <span>{{ item.scheduleLabel }}</span>
            <span>{{ item.location }}</span>
            <span>{{ item.spotsRemaining }}/{{ item.spotsTotal }} spots left</span>
          </div>
          <div class="summary-strip summary-strip--muted">
            <span>Session {{ formatMad(item.price.perSessionMad) }}</span>
            <span>Month {{ formatMad(item.price.perMonthMad) }}</span>
            <span>Trimester {{ formatMad(item.price.perTrimesterMad) }}</span>
          </div>
          <p class="module-note">{{ item.ageRequirement }} · {{ item.gradeRequirement }}</p>
          <div class="pill-row">
            <a v-for="asset in item.media" :key="asset.id" class="asset-pill" :href="asset.url" :target="asset.kind === 'video' ? '_blank' : undefined" :rel="asset.kind === 'video' ? 'noreferrer' : undefined">{{ asset.kind.toUpperCase() }} · {{ asset.label }}</a>
          </div>
          <div class="stack stack--compact" style="margin-top: 12px;">
            <article v-for="review in item.reviews" :key="review.id" class="list-card">
              <div class="list-card__header">
                <h3>{{ review.parentName }}</h3>
                <span class="status-pill status-pill--neutral">{{ ratingStars(review.rating) }}</span>
              </div>
              <p>{{ review.comment }}</p>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">6.2 Booking and reservation</p>
          <h2>Book, cancel, waitlist, package deals</h2>
          <p>Book directly, get instant confirmation, cancel with clear 24h policy, and choose pay-now or monthly invoice.</p>
        </div>
        <label class="field-stack">
          <span>Activity</span>
          <select v-model="selectedActivityId" class="input-select">
            <option v-for="item in catalogItems" :key="item.id" :value="item.id">{{ item.name }} · {{ item.spotsRemaining }} spots left</option>
          </select>
        </label>
        <label class="field-stack">
          <span>Payment mode</span>
          <select v-model="bookingPaymentMode" class="input-select">
            <option value="pay_now">Pay now</option>
            <option value="invoice">Add to monthly invoice</option>
          </select>
        </label>
        <label class="field-stack">
          <span>Package deal (optional)</span>
          <select v-model="selectedPackageDeal" class="input-select">
            <option value="">No package</option>
            <option v-for="deal in props.viewModel.booking.packageDeals" :key="deal.id" :value="deal.id">{{ deal.label }} · {{ deal.bonus }}</option>
          </select>
        </label>
        <label class="checkbox-row">
          <input v-model="trialSession" type="checkbox" />
          <span>Request trial session</span>
        </label>
        <button class="button button--primary" type="button" :disabled="bookingLoading" @click="submitBooking">
          {{ bookingLoading ? 'Processing...' : 'Book activity' }}
        </button>
        <p v-if="bookingFeedback" class="form-message" :class="{ 'form-message--error': bookingFeedbackTone === 'error' }">{{ bookingFeedback }}</p>
        <p class="module-note">{{ props.viewModel.booking.cancellationPolicy }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Current bookings</p>
          <h2>Confirmed and waitlist entries</h2>
          <p>Waitlist entries are auto-notified when a cancellation opens a seat.</p>
        </div>
        <div class="stack">
          <article v-for="item in bookingItems" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.activityName }}</h3>
                <p>{{ formatTimestamp(item.sessionStartsAt) }}</p>
              </div>
              <span :class="bookingStatusClass(item.status)">{{ bookingStatusLabel(item.status) }}</span>
            </div>
            <p>{{ item.paymentMode === 'pay_now' ? 'Pay now' : 'Monthly invoice' }} · {{ item.paymentStatus }}</p>
            <small>
              {{ item.status === 'waitlist' ? `Waitlist position #${item.waitlistPosition}` : item.confirmationCode ? `Confirmation ${item.confirmationCode}` : 'No confirmation code' }}
            </small>
            <div class="pill-row" style="margin-top: 12px;" v-if="item.status !== 'cancelled'">
              <button class="button button--secondary" type="button" :disabled="bookingLoading" @click="cancelBooking(item.id)">Cancel booking</button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">6.3 Activity tracking</p>
        <h2>Progress reports, skills, attendance, certificates</h2>
        <p>Weekly instructor updates, session media, assessments, and participation certificates stay visible.</p>
      </div>
      <div v-if="props.viewModel.tracking.items.length" class="subject-grid">
        <article v-for="item in props.viewModel.tracking.items" :key="item.activityId" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">Tracking</p>
              <h3>{{ item.activityName }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ item.attendance.filter((entry) => entry.attended).length }}/{{ item.attendance.length }} sessions attended</span>
          </div>
          <div class="stack stack--compact">
            <article v-for="report in item.weeklyReports" :key="report.id" class="list-card">
              <h3>{{ report.weekLabel }}</h3>
              <p>{{ report.summary }}</p>
              <small>{{ report.skillFocus }} · Next: {{ report.nextStep }}</small>
            </article>
          </div>
          <div class="pill-row" style="margin-top: 12px;">
            <a v-for="asset in item.sessionMedia" :key="asset.id" class="asset-pill" :href="asset.url" :target="asset.kind === 'video' ? '_blank' : undefined" :rel="asset.kind === 'video' ? 'noreferrer' : undefined">{{ asset.kind.toUpperCase() }} · {{ asset.label }}</a>
          </div>
          <ul class="plain-list plain-list--tight">
            <li v-for="skill in item.skillAssessment" :key="skill.id">{{ skill.skill }}: {{ skill.level }} - {{ skill.detail }}</li>
          </ul>
          <p class="module-note">{{ item.showcaseInfo }}</p>
          <div class="pill-row">
            <a class="asset-pill" :href="item.participationCertificateUrl">Participation certificate PDF</a>
          </div>
        </article>
      </div>
      <p v-else class="module-note">No activity tracking records yet for this child.</p>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">6.4 Summer and holiday programs</p>
        <h2>Camp and workshop registration</h2>
        <p>View full seasonal program details and register with early discount when available.</p>
      </div>
      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Register program</p>
            <h3>Seasonal enrollment</h3>
          </div>
          <label class="field-stack">
            <span>Program</span>
            <select v-model="selectedProgramId" class="input-select">
              <option v-for="item in programItems" :key="item.id" :value="item.id">{{ item.title }} · {{ item.availableSpots }} spots</option>
            </select>
          </label>
          <label class="checkbox-row">
            <input v-model="applyEarlyDiscount" type="checkbox" />
            <span>Apply early registration discount if eligible</span>
          </label>
          <button class="button button--primary" type="button" :disabled="programLoading" @click="submitProgramRegistration">
            {{ programLoading ? 'Submitting...' : 'Register program' }}
          </button>
          <p v-if="programFeedback" class="form-message" :class="{ 'form-message--error': programFeedbackTone === 'error' }">{{ programFeedback }}</p>
        </article>
        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Program catalog</p>
            <h3>Upcoming seasonal options</h3>
          </div>
          <div class="stack">
            <article v-for="item in programItems" :key="item.id" class="list-card">
              <div class="list-card__header">
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.kind === 'summer_camp' ? 'Summer camp' : 'Holiday workshop' }}</p>
                </div>
                <span class="status-pill status-pill--neutral">{{ item.availableSpots }} spots</span>
              </div>
              <p>{{ item.summary }}</p>
              <small>{{ formatDate(item.startsAt) }} - {{ formatDate(item.endsAt) }} · {{ item.location }}</small>
              <div class="summary-strip summary-strip--muted">
                <span>{{ formatMad(item.priceMad) }}</span>
                <span>Early discount {{ formatMad(item.earlyRegistrationDiscountMad) }}</span>
                <span>{{ item.ageRequirement }}</span>
              </div>
            </article>
          </div>
        </article>
      </div>
      <div class="stack" style="margin-top: 18px;">
        <article v-for="item in programRegistrations" :key="item.id" class="list-card">
          <div class="list-card__header">
            <h3>{{ item.programId }}</h3>
            <span :class="registrationStatusClass(item.status)">{{ item.status }}</span>
          </div>
          <p>Submitted {{ formatTimestamp(item.submittedAt) }}</p>
          <small>{{ item.seatCode ? `Seat ${item.seatCode}` : 'Seat code pending' }} · Discount {{ formatMad(item.discountAppliedMad) }}</small>
        </article>
      </div>
    </section>
  </div>
</template>

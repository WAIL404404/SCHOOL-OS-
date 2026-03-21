<script setup lang="ts">
import { motion } from 'motion-v'
import type { ParentSchoolLifeView, SchoolLifeEventRecord } from '~/shared/app/types'

const props = defineProps<{ viewModel: ParentSchoolLifeView }>()
const emit = defineEmits<{ selectChild: [childId: string] }>()

const mealSelectionId = ref('')
const mealParentRating = ref(4)
const mealChildRating = ref(4)
const mealFeedback = ref('')
const mealFeedbackTone = ref<'success' | 'error'>('success')

const specialDietType = ref<'halal' | 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'custom'>('halal')
const specialDietDetail = ref('')
const specialDietFeedback = ref('')
const specialDietFeedbackTone = ref<'success' | 'error'>('success')

const rsvpState = reactive<Record<string, 'going' | 'maybe' | 'not_going'>>({})
const volunteerState = reactive<Record<string, boolean>>({})
const eventFeedback = ref('')
const eventFeedbackTone = ref<'success' | 'error'>('success')

const showLeaderboard = ref(true)

watch(
  () => props.viewModel.activeChildId,
  () => {
    mealFeedback.value = ''
    specialDietFeedback.value = ''
    eventFeedback.value = ''
    syncMealSelection()
    syncEventState()
  },
  { immediate: true }
)

watch(
  () => props.viewModel.canteen.weeklyMenu,
  () => {
    syncMealSelection()
  },
  { immediate: true }
)

function syncMealSelection() {
  const menu = props.viewModel.canteen.weeklyMenu
  const activeMeal = menu.find((item) => item.id === mealSelectionId.value) ?? menu.find((item) => item.preselected) ?? menu[0] ?? null
  mealSelectionId.value = activeMeal?.id ?? ''
  mealParentRating.value = activeMeal?.parentRating ?? 4
  mealChildRating.value = activeMeal?.childRating ?? 4
}

function syncEventState() {
  for (const item of props.viewModel.events.items) {
    if (!(item.id in rsvpState)) {
      rsvpState[item.id] = item.rsvpStatus === 'pending' ? 'maybe' : item.rsvpStatus
    }
    if (!(item.id in volunteerState)) {
      volunteerState[item.id] = item.volunteerSignedUp
    }
  }
}

const selectedMeal = computed(() => props.viewModel.canteen.weeklyMenu.find((item) => item.id === mealSelectionId.value) ?? null)
const allergyWarnings = computed(() => {
  const allergies = props.viewModel.health.allergies.map((item) => item.toLowerCase())
  if (!allergies.length) return []

  return props.viewModel.canteen.weeklyMenu.filter((item) => item.allergens.some((allergen) => allergies.includes(allergen.toLowerCase())))
})

const safeMeals = computed(() => props.viewModel.canteen.weeklyMenu.filter((item) => !allergyWarnings.value.some((warning) => warning.id === item.id)))

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return `${start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} ${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

function formatMad(amount: number) {
  return `MAD ${Math.round(amount).toLocaleString('en-GB')}`
}

function moodLabel(mood: ParentSchoolLifeView['dailyReport']['mood']) {
  if (mood === 'happy') return 'Happy'
  if (mood === 'sad') return 'Sad'
  return 'Okay'
}

function moodClass(mood: ParentSchoolLifeView['dailyReport']['mood']) {
  if (mood === 'happy') return 'status-pill'
  if (mood === 'sad') return 'status-pill status-pill--alert'
  return 'status-pill status-pill--warning'
}

function paymentClass(status: 'paid' | 'pending' | 'blocked') {
  if (status === 'paid') return 'status-pill'
  if (status === 'blocked') return 'status-pill status-pill--alert'
  return 'status-pill status-pill--warning'
}

function mealSaveMessage(action: 'preselect' | 'rate') {
  const meal = selectedMeal.value
  if (!meal) {
    mealFeedbackTone.value = 'error'
    mealFeedback.value = 'Select a weekly meal first.'
    return
  }

  mealFeedbackTone.value = 'success'
  mealFeedback.value = action === 'preselect'
    ? `${meal.mealName} is selected for the week.`
    : `Feedback saved for ${meal.mealName} with parent ${mealParentRating.value}/5 and child ${mealChildRating.value}/5.`
}

function chooseMeal(itemId: string) {
  mealSelectionId.value = itemId
  syncMealSelection()
}

function submitDietRequest() {
  if (!specialDietDetail.value.trim()) {
    specialDietFeedbackTone.value = 'error'
    specialDietFeedback.value = 'Add a short reason before sending the request.'
    return
  }

  specialDietFeedbackTone.value = 'success'
  specialDietFeedback.value = `Special diet request for ${specialDietType.value.replace('_', ' ')} submitted.`
  specialDietDetail.value = ''
}

function updateRsvp(event: SchoolLifeEventRecord, status: 'going' | 'maybe' | 'not_going') {
  rsvpState[event.id] = status
  eventFeedbackTone.value = 'success'
  eventFeedback.value = `${event.title} RSVP updated to ${status.replace('_', ' ')}.`
}

function toggleVolunteer(event: SchoolLifeEventRecord) {
  volunteerState[event.id] = !volunteerState[event.id]
  eventFeedbackTone.value = 'success'
  eventFeedback.value = volunteerState[event.id]
    ? `Volunteer sign-up confirmed for ${event.title}.`
    : `Volunteer sign-up removed for ${event.title}.`
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
          <p class="eyebrow">School life</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ formatMad(props.viewModel.canteen.balanceMad) }} canteen balance</span>
            <span>{{ props.viewModel.health.allergies.length }} allergy flag(s)</span>
            <span>{{ moodLabel(props.viewModel.dailyReport.mood) }} daily report</span>
          </div>
          <p class="dashboard-hero-card__highlight">Canteen, infirmary, daily reporting, behavior, and school events now share one family workspace.</p>
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
            <p class="eyebrow">School life</p>
            <h3>No school life profile linked yet</h3>
            <p>Once a child profile is linked, the canteen menu, medical file, daily report, behavior history, and school events will appear here automatically.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Daily school-life pulse</h2>
        <p>The most important school-life signals stay visible at the top of the module.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
      <p v-if="props.viewModel.activeChild && allergyWarnings.length" class="module-note">
        Allergies flagged automatically: {{ allergyWarnings.map((item) => item.dayLabel + ' · ' + item.mealName).join(' | ') }}
      </p>
      <p v-else-if="props.viewModel.activeChild" class="module-note">No allergen conflict detected in this week's menu.</p>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">11.1 Canteen / Cafeteria</p>
          <h2>Weekly menu, ratings, and balance</h2>
          <p>Menu photos, nutrition, allergen warnings, meal preselection, ratings, and payment tracking stay in one place.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>{{ formatMad(props.viewModel.canteen.balanceMad) }} balance</span>
          <span>{{ props.viewModel.canteen.paymentHistory.length }} payment(s)</span>
          <span>{{ safeMeals.length }} safe meal option(s)</span>
          <span>{{ props.viewModel.canteen.specialDietRequests.length }} diet request(s)</span>
        </div>
        <p class="module-note">{{ props.viewModel.canteen.notes }}</p>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Preselect and rate</p>
          <h3>{{ selectedMeal?.mealName ?? 'Select a weekly meal' }}</h3>
          <p v-if="selectedMeal">Parent and child feedback can be captured before the week starts.</p>
        </div>
        <div class="stack stack--compact">
          <label class="field-stack">
            <span>Weekly meal</span>
            <select v-model="mealSelectionId" class="input-select" @change="syncMealSelection">
              <option v-for="item in props.viewModel.canteen.weeklyMenu" :key="item.id" :value="item.id">{{ item.dayLabel }} - {{ item.mealName }}</option>
            </select>
          </label>
          <div class="two-column two-column--balanced two-column--secondary">
            <label class="field-stack">
              <span>Parent rating</span>
              <select v-model="mealParentRating" class="input-select">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
              </select>
            </label>
            <label class="field-stack">
              <span>Child rating</span>
              <select v-model="mealChildRating" class="input-select">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
                <option :value="4">4</option>
                <option :value="5">5</option>
              </select>
            </label>
          </div>
          <div class="pill-row">
            <button class="button button--secondary" type="button" @click="mealSaveMessage('preselect')">Preselect meal</button>
            <button class="button button--primary" type="button" @click="mealSaveMessage('rate')">Save ratings</button>
          </div>
          <p v-if="mealFeedback" class="form-message" :class="{ 'form-message--error': mealFeedbackTone === 'error' }">{{ mealFeedback }}</p>
        </div>

        <div class="subject-grid" style="margin-top: 18px;">
          <article v-for="item in props.viewModel.canteen.weeklyMenu" :key="item.id" class="subject-card" :class="{ 'subject-card--active': item.id === mealSelectionId }">
            <img :src="item.photoUrl" :alt="item.photoLabel" style="width: 100%; border-radius: 18px; margin-bottom: 14px;" />
            <div class="subject-card__header">
              <div>
                <p class="eyebrow">{{ item.dayLabel }}</p>
                <h3>{{ item.mealName }}</h3>
              </div>
              <span v-if="item.preselected" class="status-pill">Preselected</span>
              <span v-else class="status-pill status-pill--neutral">Optional</span>
            </div>
            <p>{{ item.nutrition }}</p>
            <div class="summary-strip summary-strip--muted">
              <span>Parent {{ item.parentRating }}/5</span>
              <span>Child {{ item.childRating }}/5</span>
            </div>
            <div class="pill-row">
              <span v-for="tag in item.dietTags" :key="tag" class="status-pill status-pill--neutral">{{ tag.replace('_', ' ') }}</span>
            </div>
            <div class="pill-row" style="margin-top: 12px;">
              <button class="button button--secondary" type="button" @click="chooseMeal(item.id)">Choose</button>
            </div>
            <p v-if="item.allergens.length" class="module-note">Allergens: {{ item.allergens.join(', ') }}</p>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Payments and diet requests</p>
          <h3>Balance, top-ups, and special diets</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="payment in props.viewModel.canteen.paymentHistory" :key="payment.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ payment.label }}</h3>
                <p>{{ formatMad(payment.amountMad) }} · {{ payment.method }}</p>
              </div>
              <span :class="paymentClass(payment.status)">{{ payment.status }}</span>
            </div>
            <p>{{ payment.note }}</p>
            <small>{{ formatTimestamp(payment.postedAt) }}</small>
          </article>
          <article v-for="request in props.viewModel.canteen.specialDietRequests" :key="request.id" class="alert-item alert-item--info">
            <div class="alert-item__icon">i</div>
            <div>
              <h3>{{ request.type.replace('_', ' ') }}</h3>
              <p>{{ request.detail }}</p>
              <small>{{ request.status }} · {{ formatTimestamp(request.createdAt) }}</small>
            </div>
          </article>
        </div>
        <div class="stack stack--compact" style="margin-top: 16px;">
          <label class="field-stack">
            <span>Special diet request type</span>
            <select v-model="specialDietType" class="input-select">
              <option value="halal">Halal</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten_free">Gluten free</option>
              <option value="dairy_free">Dairy free</option>
              <option value="nut_free">Nut free</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label class="field-stack">
            <span>Request detail</span>
            <textarea v-model="specialDietDetail" class="input-textarea" rows="3" placeholder="Explain the reason for the request."></textarea>
          </label>
          <button class="button button--primary" type="button" @click="submitDietRequest">Send request</button>
          <p v-if="specialDietFeedback" class="form-message" :class="{ 'form-message--error': specialDietFeedbackTone === 'error' }">{{ specialDietFeedback }}</p>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">11.2 Infirmary / Health</p>
          <h2>Medical file, incidents, and recommendations</h2>
          <p>Blood type, allergies, medication, vaccinations, emergency contacts, and school nurse notes are gathered here.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>Blood type {{ props.viewModel.health.bloodType }}</span>
          <span>{{ props.viewModel.health.allergies.length }} allergy/allergies</span>
          <span>{{ props.viewModel.health.incidents.length }} incident(s)</span>
          <span>{{ props.viewModel.health.visits.length }} visit(s)</span>
        </div>
        <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 16px;">
          <article class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Medical file</p>
              <h3>Current profile</h3>
            </div>
            <ul class="plain-list plain-list--tight">
              <li><strong>Allergies:</strong> {{ props.viewModel.health.allergies.join(', ') || 'None' }}</li>
              <li><strong>Chronic conditions:</strong> {{ props.viewModel.health.chronicConditions.join(', ') || 'None' }}</li>
              <li><strong>Medication:</strong> {{ props.viewModel.health.currentMedications.join(', ') || 'None' }}</li>
            </ul>
          </article>
          <article class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Emergency contacts</p>
              <h3>Priority order</h3>
            </div>
            <div class="stack stack--compact">
              <article v-for="contact in props.viewModel.health.emergencyContacts" :key="contact.id" class="list-card">
                <div class="list-card__header">
                  <div>
                    <h3>{{ contact.fullName }}</h3>
                    <p>{{ contact.relationship }}</p>
                  </div>
                  <span class="status-pill status-pill--neutral">#{{ contact.priority }}</span>
                </div>
                <small>{{ contact.phone }}</small>
              </article>
            </div>
          </article>
        </div>

        <div class="stack" style="margin-top: 18px;">
          <article v-for="vaccination in props.viewModel.health.vaccinations" :key="vaccination.id" class="alert-item" :class="vaccination.status === 'missing' ? 'alert-item--warning' : vaccination.status === 'due_soon' ? 'alert-item--info' : 'alert-item--calm'">
            <div class="alert-item__icon">•</div>
            <div>
              <h3>{{ vaccination.label }}</h3>
              <p>{{ vaccination.note }}</p>
              <small>{{ vaccination.status }} · {{ formatTimestamp(vaccination.updatedAt) }}</small>
            </div>
          </article>
          <article v-for="incident in props.viewModel.health.incidents" :key="incident.id" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>{{ incident.title }}</h3>
              <p>{{ incident.whatHappened }}</p>
              <small>{{ incident.actionTaken }}</small>
              <p v-if="incident.pickupRequested" class="module-note">Pickup request was triggered.</p>
            </div>
          </article>
          <article v-for="visit in props.viewModel.health.visits" :key="visit.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ visit.doctor }}</h3>
                <p>{{ visit.reason }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ visit.followUpAt ? 'Follow-up' : 'Closed' }}</span>
            </div>
            <p>{{ visit.recommendation }}</p>
            <small>{{ formatTimestamp(visit.visitedAt) }}</small>
          </article>
          <article class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Recommendations</p>
              <h3>Doctor notes</h3>
            </div>
            <ul class="plain-list plain-list--tight">
              <li v-for="item in props.viewModel.health.recommendations" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">11.3 Daily report</p>
          <h2>End-of-day preschool report</h2>
          <p>Meals, naps, mood, activities, photos, comments, and skill progress arrive automatically at the end of the day.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>{{ props.viewModel.dailyReport.ate ? 'Ate lunch' : 'Did not eat' }}</span>
          <span>{{ props.viewModel.dailyReport.nap ? `Napped ${props.viewModel.dailyReport.napDuration}` : 'No nap' }}</span>
          <span>{{ moodLabel(props.viewModel.dailyReport.mood) }}</span>
          <span>Sent {{ formatTimestamp(props.viewModel.dailyReport.sentAt) }}</span>
        </div>
        <article class="list-card" style="margin-top: 16px;">
          <div class="list-card__header">
            <div>
              <h3>Teacher comment</h3>
              <p>{{ props.viewModel.dailyReport.mealAmount }}</p>
            </div>
            <span :class="moodClass(props.viewModel.dailyReport.mood)">{{ moodLabel(props.viewModel.dailyReport.mood) }}</span>
          </div>
          <p>{{ props.viewModel.dailyReport.teacherComment }}</p>
        </article>
        <div class="subject-grid" style="margin-top: 16px;">
          <article v-for="photo in props.viewModel.dailyReport.photos" :key="photo.id" class="subject-card">
            <img :src="photo.url" :alt="photo.label" style="width: 100%; border-radius: 18px; margin-bottom: 14px;" />
            <p class="eyebrow">{{ photo.label }}</p>
            <p>{{ photo.caption }}</p>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="activity in props.viewModel.dailyReport.activities" :key="activity" class="list-card">
            <h3>{{ activity }}</h3>
          </article>
        </div>
        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Skills development</p>
          <h3>Progress notes</h3>
        </div>
        <div class="stack">
          <article v-for="skill in props.viewModel.dailyReport.skills" :key="skill.id" class="alert-item alert-item--calm">
            <div class="alert-item__icon">•</div>
            <div>
              <h3>{{ skill.label }}</h3>
              <p>{{ skill.detail }}</p>
              <small>{{ skill.level }}</small>
            </div>
          </article>
        </div>
        <p class="module-note">Diaper changes: {{ props.viewModel.dailyReport.diaperChanges === null ? 'Not applicable' : props.viewModel.dailyReport.diaperChanges }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">11.4 Behavior and rewards</p>
          <h2>Points, badges, and behavior history</h2>
          <p>Positive behavior points, behavior alerts, monthly reports, and optional leaderboard settings stay visible.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>{{ props.viewModel.behavior.points }} points</span>
          <span>{{ props.viewModel.behavior.badges.length }} badge(s)</span>
          <span>{{ props.viewModel.behavior.alerts.length }} alert(s)</span>
          <span>{{ props.viewModel.behavior.monthlyReports.length }} month(s)</span>
        </div>
        <div class="subject-grid" style="margin-top: 16px;">
          <article v-for="badge in props.viewModel.behavior.badges" :key="badge.id" class="subject-card">
            <p class="eyebrow">Badge</p>
            <h3>{{ badge.title }}</h3>
            <p>{{ badge.detail }}</p>
            <small>{{ formatTimestamp(badge.earnedAt) }}</small>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="item in props.viewModel.behavior.alerts" :key="item.id" class="alert-item" :class="`alert-item--${item.tone}`">
            <div class="alert-item__icon">{{ item.tone === 'warning' ? '!' : item.tone === 'info' ? 'i' : '•' }}</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.context }} · {{ formatTimestamp(item.createdAt) }}</small>
            </div>
          </article>
        </div>
        <div class="stack" style="margin-top: 18px;">
          <article v-for="month in props.viewModel.behavior.monthlyReports" :key="month.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ month.monthLabel }}</h3>
                <p>{{ month.points }} points</p>
              </div>
              <span v-if="month.leaderboardRank" class="status-pill status-pill--neutral">Rank #{{ month.leaderboardRank }}</span>
            </div>
            <p><strong>Highlights:</strong> {{ month.positiveHighlights.join(', ') }}</p>
            <p><strong>Focus:</strong> {{ month.improvementArea }}</p>
          </article>
        </div>
        <div v-if="props.viewModel.behavior.leaderboardEnabled" class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Leaderboard</p>
          <h3>Optional ranking</h3>
        </div>
        <div v-if="props.viewModel.behavior.leaderboardEnabled && showLeaderboard" class="stack">
          <article v-for="item in props.viewModel.behavior.leaderboard" :key="item.rank" class="list-card">
            <div class="list-card__header">
              <h3>#{{ item.rank }} {{ item.name }}</h3>
              <span class="status-pill status-pill--neutral">{{ item.points }} pts</span>
            </div>
          </article>
        </div>
        <button v-if="props.viewModel.behavior.leaderboardEnabled" class="text-button" type="button" @click="showLeaderboard = !showLeaderboard">
          {{ showLeaderboard ? 'Hide leaderboard' : 'Show leaderboard' }}
        </button>
        <p v-else class="module-note">Leaderboard is disabled for this child profile.</p>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">11.5 School events</p>
        <h2>Calendar, RSVP, tickets, and volunteer sign-up</h2>
        <p>Upcoming events include dress code, ticketing, media, and volunteer slots so parents can plan ahead.</p>
      </div>
      <p class="module-note">{{ props.viewModel.events.calendarLabel }} · {{ props.viewModel.events.volunteerNote }}</p>
      <p v-if="eventFeedback" class="form-message" :class="{ 'form-message--error': eventFeedbackTone === 'error' }">{{ eventFeedback }}</p>
      <div class="subject-grid">
        <article v-for="event in props.viewModel.events.items" :key="event.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ formatDateRange(event.startsAt, event.endsAt) }}</p>
              <h3>{{ event.title }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ rsvpState[event.id] ?? event.rsvpStatus }}</span>
          </div>
          <p>{{ event.description }}</p>
          <p><strong>Location:</strong> {{ event.location }}</p>
          <p><strong>Dress code:</strong> {{ event.dressCode }}</p>
          <div class="summary-strip summary-strip--muted">
            <span v-if="event.requiresTicket">{{ event.ticketPriceMad ? formatMad(event.ticketPriceMad) : 'Ticket required' }}</span>
            <span v-else>Free event</span>
            <span>{{ event.ticketStatus.replace('_', ' ') }}</span>
            <span>{{ event.volunteerSlots }} volunteer slot(s)</span>
          </div>
          <div class="pill-row">
            <button class="button button--secondary" type="button" @click="updateRsvp(event, 'going')">Going</button>
            <button class="button button--secondary" type="button" @click="updateRsvp(event, 'maybe')">Maybe</button>
            <button class="button button--secondary" type="button" @click="updateRsvp(event, 'not_going')">Not going</button>
          </div>
          <div class="pill-row" style="margin-top: 12px;">
            <button class="button button--primary" type="button" @click="toggleVolunteer(event)">{{ volunteerState[event.id] ? 'Volunteer signed up' : 'Sign up to volunteer' }}</button>
          </div>
          <div v-if="event.media.length" class="pill-row" style="margin-top: 12px;">
            <a v-for="asset in event.media" :key="asset.id" class="asset-pill" :href="asset.url" :target="asset.kind === 'video' ? '_blank' : undefined" :rel="asset.kind === 'video' ? 'noreferrer' : undefined">{{ asset.kind }} · {{ asset.label }}</a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

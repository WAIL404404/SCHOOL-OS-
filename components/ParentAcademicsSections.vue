<script setup lang="ts">
import { motion } from 'motion-v'
import type { AcademicRealtimeNotificationView, ParentAcademicsView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentAcademicsView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()

const scheduleMode = ref<'daily' | 'weekly'>('daily')
const selectedDayId = ref('')
const absenceReason = ref('')
const absenceFeedback = ref('')
const absenceFeedbackTone = ref<'success' | 'error'>('success')
const liveNotifications = ref<AcademicRealtimeNotificationView[]>([])
const liveNotificationsLoading = ref(false)
const liveNotificationsError = ref('')
let liveStream: EventSource | null = null

watch(
  () => props.viewModel.schedule.days,
  (days) => {
    selectedDayId.value = days[0]?.dayId ?? ''
  },
  { immediate: true }
)

watch(
  () => props.viewModel.activeChildId,
  () => {
    absenceReason.value = ''
    absenceFeedback.value = ''
    absenceFeedbackTone.value = 'success'
    liveNotificationsError.value = ''
  }
)

watch(
  () => props.viewModel.activeChildId,
  (childId) => {
    if (!import.meta.client) return
    void refreshLiveNotifications(childId)
    connectLiveStream(childId)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  disconnectLiveStream()
})

const activeDay = computed(() => props.viewModel.schedule.days.find((day) => day.dayId === selectedDayId.value) ?? props.viewModel.schedule.days[0] ?? null)

function formatTimeRange(startsAt: string, endsAt: string) {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const start = new Date(startsAt).toLocaleTimeString('en-GB', options)
  const end = new Date(endsAt).toLocaleTimeString('en-GB', options)
  return `${start}-${end}`
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusLabel(status: 'submitted' | 'pending' | 'late') {
  if (status === 'submitted') return 'Submitted'
  if (status === 'late') return 'Late'
  return 'Pending'
}

function statusPillClass(status: 'submitted' | 'pending' | 'late') {
  if (status === 'late') return 'status-pill status-pill--alert'
  if (status === 'pending') return 'status-pill status-pill--warning'
  return 'status-pill status-pill--neutral'
}

function attendanceHistoryLabel(status: 'present' | 'absent' | 'late') {
  if (status === 'absent') return 'Absent'
  if (status === 'late') return 'Late'
  return 'Present'
}

function attendanceHistoryClass(status: 'present' | 'absent' | 'late') {
  if (status === 'absent') return 'status-pill status-pill--alert'
  if (status === 'late') return 'status-pill status-pill--warning'
  return 'status-pill'
}

function upsertLiveNotification(item: AcademicRealtimeNotificationView) {
  const next = [item, ...liveNotifications.value.filter((existing) => existing.id !== item.id)]
  next.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  liveNotifications.value = next.slice(0, 16)
}

function disconnectLiveStream() {
  if (liveStream) {
    liveStream.close()
    liveStream = null
  }
}

function connectLiveStream(childId: string | null) {
  disconnectLiveStream()
  if (!childId) return

  const streamUrl = `/api/parent/academics/stream?child=${encodeURIComponent(childId)}`
  const eventSource = new EventSource(streamUrl)
  liveStream = eventSource

  eventSource.addEventListener('snapshot', (rawEvent) => {
    try {
      const payload = JSON.parse((rawEvent as MessageEvent).data) as { items?: AcademicRealtimeNotificationView[] }
      liveNotifications.value = (payload.items ?? []).slice(0, 16)
      liveNotificationsError.value = ''
    } catch {
      liveNotificationsError.value = 'Live stream payload could not be parsed.'
    }
  })

  eventSource.addEventListener('notification', (rawEvent) => {
    try {
      const payload = JSON.parse((rawEvent as MessageEvent).data) as { item?: AcademicRealtimeNotificationView }
      if (payload.item) upsertLiveNotification(payload.item)
    } catch {
      liveNotificationsError.value = 'A live notification update failed to load.'
    }
  })

  eventSource.onerror = () => {
    liveNotificationsError.value = 'Live updates disconnected. Reloading the feed can restore it.'
  }
}

async function refreshLiveNotifications(childId: string | null) {
  if (!childId) {
    liveNotifications.value = []
    return
  }

  liveNotificationsLoading.value = true
  liveNotificationsError.value = ''
  try {
    const payload = await $fetch<{ items: AcademicRealtimeNotificationView[] }>('/api/parent/academics/notifications', {
      query: { child: childId }
    })
    liveNotifications.value = payload.items.slice(0, 16)
  } catch {
    liveNotificationsError.value = 'Could not load the notification feed right now.'
  } finally {
    liveNotificationsLoading.value = false
  }
}

async function submitAbsenceReason() {
  const reason = absenceReason.value.trim()
  if (!reason) {
    absenceFeedbackTone.value = 'error'
    absenceFeedback.value = 'Add a short reason before sending it to the school office.'
    return
  }

  const childId = props.viewModel.activeChildId
  if (!childId) {
    absenceFeedbackTone.value = 'error'
    absenceFeedback.value = 'No linked child is selected for this note.'
    return
  }

  try {
    const response = await $fetch<{
      note: { createdAt: string }
      notification?: AcademicRealtimeNotificationView
    }>('/api/parent/attendance-reasons', {
      method: 'POST',
      body: { childId, reason }
    })

    if (response.notification) {
      upsertLiveNotification(response.notification)
    }

    absenceFeedbackTone.value = 'success'
    absenceFeedback.value = `Reason submitted for ${props.viewModel.activeChild?.fullName ?? 'your child'} at ${formatTimestamp(response.note.createdAt)}. The school office will review it alongside attendance history.`
    absenceReason.value = ''
  } catch {
    absenceFeedbackTone.value = 'error'
    absenceFeedback.value = 'Reason could not be submitted. Please try again.'
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
          <p class="eyebrow">Academics overview</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ props.viewModel.grades.overallAverage }} average</span>
            <span>{{ props.viewModel.exams.nextReminder }}</span>
            <span>{{ props.viewModel.attendance.badge.label }}</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ props.viewModel.grades.yearComparison }}</p>
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
            <p class="eyebrow">Academics overview</p>
            <h3>No academic profile linked yet</h3>
            <p>Once the school links a student record, timetable, grades, homework, exams, and attendance will all appear here automatically.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Academic pulse</h2>
        <p>The most important school signals for the selected child stay visible at the top of the module.</p>
      </div>
      <div class="stat-grid stat-grid--four">
        <article v-for="stat in props.viewModel.heroStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="module-section__header">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Timetable</p>
            <h2>Daily and weekly schedule</h2>
            <p>Subjects are color-coded, exam days are highlighted, and upcoming sessions keep their reminder timing visible.</p>
          </div>
          <div class="segment-control">
            <button class="segment-control__button" :class="{ 'segment-control__button--active': scheduleMode === 'daily' }" type="button" @click="scheduleMode = 'daily'">Daily</button>
            <button class="segment-control__button" :class="{ 'segment-control__button--active': scheduleMode === 'weekly' }" type="button" @click="scheduleMode = 'weekly'">Weekly</button>
          </div>
        </div>

        <div v-if="scheduleMode === 'daily' && activeDay" class="stack">
          <div class="day-tabs">
            <button
              v-for="day in props.viewModel.schedule.days"
              :key="day.dayId"
              class="day-tabs__button"
              :class="{ 'day-tabs__button--active': day.dayId === activeDay.dayId }"
              type="button"
              @click="selectedDayId = day.dayId"
            >
              <strong>{{ day.dayLabel }}</strong>
              <small>{{ day.dateLabel }}</small>
            </button>
          </div>
          <article v-for="entry in activeDay.entries" :key="entry.id" class="lesson-card" :style="{ '--subject-accent': entry.color }">
            <div class="lesson-card__time">
              <strong>{{ formatTimeRange(entry.startsAt, entry.endsAt) }}</strong>
              <small>{{ entry.notificationLeadMinutes }} min reminder</small>
            </div>
            <div class="lesson-card__body">
              <div class="lesson-card__row">
                <h3>{{ entry.subject }}</h3>
                <span v-if="entry.isExamDay" class="status-pill status-pill--warning">Exam day</span>
              </div>
              <p>{{ entry.teacher }} · {{ entry.room }}</p>
              <p v-if="entry.note">{{ entry.note }}</p>
              <p v-if="entry.changeLabel" class="lesson-card__change">{{ entry.changeLabel }}</p>
            </div>
          </article>
        </div>

        <div v-else class="schedule-week-grid">
          <article v-for="day in props.viewModel.schedule.days" :key="day.dayId" class="schedule-day-card" :class="{ 'schedule-day-card--exam': day.hasExam }">
            <div class="schedule-day-card__header">
              <div>
                <h3>{{ day.dayLabel }}</h3>
                <p>{{ day.dateLabel }}</p>
              </div>
              <span v-if="day.hasExam" class="status-pill status-pill--warning">Exam</span>
            </div>
            <div class="stack stack--compact">
              <div v-for="entry in day.entries" :key="entry.id" class="schedule-mini-row" :style="{ '--subject-accent': entry.color }">
                <strong>{{ entry.subject }}</strong>
                <span>{{ formatTimeRange(entry.startsAt, entry.endsAt) }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Notifications and calendar</p>
          <h2>Live changes and reminders</h2>
          <p>Teacher swaps, room changes, and calendar exports stay together so parents can react quickly.</p>
        </div>

        <div class="stack">
          <article v-for="update in props.viewModel.schedule.updates" :key="update.id" class="alert-item" :class="`alert-item--${update.tone}`">
            <div class="alert-item__icon">{{ update.tone === 'warning' ? '!' : update.tone === 'info' ? 'i' : '•' }}</div>
            <div>
              <h3>{{ update.title }}</h3>
              <p>{{ update.detail }}</p>
              <small>{{ update.effectiveAt }}</small>
            </div>
          </article>
        </div>

        <div class="section-copy section-copy--tight">
          <p class="eyebrow">Live feed</p>
          <h3>Realtime notifications</h3>
          <p>Hooks for class reminders, attendance alerts, homework deadlines, and submitted parent notes appear here.</p>
        </div>
        <p v-if="liveNotificationsLoading && !liveNotifications.length" class="module-note">Loading live notifications...</p>
        <p v-else-if="liveNotificationsError" class="form-message form-message--error">{{ liveNotificationsError }}</p>
        <div v-else-if="liveNotifications.length" class="stack stack--compact">
          <article v-for="notification in liveNotifications" :key="notification.id" class="alert-item" :class="`alert-item--${notification.tone}`">
            <div class="alert-item__icon">{{ notification.tone === 'warning' ? '!' : notification.tone === 'info' ? 'i' : '•' }}</div>
            <div>
              <h3>{{ notification.title }}</h3>
              <p>{{ notification.detail }}</p>
              <small>{{ formatTimestamp(notification.createdAt) }} · {{ notification.source }}</small>
            </div>
          </article>
        </div>
        <p v-else class="module-note">No live notifications yet for this child.</p>

        <div v-if="props.viewModel.schedule.examDayLabels.length" class="pill-row">
          <span v-for="day in props.viewModel.schedule.examDayLabels" :key="day" class="status-pill status-pill--warning">{{ day }}</span>
        </div>

        <div class="sync-row">
          <a
            v-for="link in props.viewModel.schedule.calendarLinks"
            :key="link.label"
            class="button button--secondary"
            :href="link.href"
            :target="link.kind === 'google' ? '_blank' : undefined"
            :rel="link.kind === 'google' ? 'noreferrer' : undefined"
            :download="link.kind === 'apple' ? `${props.viewModel.activeChild?.fullName ?? 'academics'}-calendar.ics` : undefined"
          >
            {{ link.label }}
          </a>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">Grades and report cards</p>
        <h2>Progress, teacher comments, and report download</h2>
        <p>Results stay visible subject by subject, with class-average context and a simple evolution graph over time.</p>
      </div>

      <div class="two-column two-column--balanced two-column--secondary">
        <article class="panel-card panel-card--soft panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Report card</p>
            <h3>{{ props.viewModel.grades.reportCard?.trimesterLabel ?? 'Report card pending' }}</h3>
            <p>{{ props.viewModel.grades.reportCard ? `Published ${props.viewModel.grades.reportCard.publishedAt}` : 'The trimester PDF will appear here once published.' }}</p>
          </div>
          <div class="summary-strip summary-strip--muted">
            <span>{{ props.viewModel.grades.overallAverage }} average</span>
            <span>{{ props.viewModel.grades.classAverage }} class average</span>
          </div>
          <p class="module-note">{{ props.viewModel.grades.rankingEnabled ? 'Ranking is enabled for this student and appears on subject cards where available.' : 'Ranking is hidden for this student because the school has disabled cohort ranking.' }}</p>
          <a v-if="props.viewModel.grades.reportCard" class="button button--primary" :href="props.viewModel.grades.reportCard.downloadUrl">Download PDF</a>
        </article>

        <article class="panel-card panel-card--inner">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Grade evolution</p>
            <h3>Student vs class average</h3>
            <p>{{ props.viewModel.grades.yearComparison }}</p>
          </div>
          <div class="grade-chart" v-if="props.viewModel.grades.chart.length">
            <div v-for="point in props.viewModel.grades.chart" :key="point.label" class="grade-chart__group">
              <div class="grade-chart__bars">
                <div class="grade-chart__bar grade-chart__bar--student" :style="{ height: `${point.scoreHeight}%` }" :title="point.scoreLabel"></div>
                <div class="grade-chart__bar grade-chart__bar--class" :style="{ height: `${point.classAverageHeight}%` }" :title="point.classAverageLabel"></div>
              </div>
              <strong>{{ point.label }}</strong>
            </div>
          </div>
          <p v-else>No grade history available yet.</p>
        </article>
      </div>

      <div class="subject-grid">
        <article v-for="subject in props.viewModel.grades.subjects" :key="subject.id" class="subject-card" :style="{ '--subject-accent': subject.color }">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ subject.subject }}</p>
              <h3>{{ subject.latestGrade }}</h3>
            </div>
            <span class="status-pill status-pill--neutral">{{ subject.classAverage }} class avg</span>
          </div>
          <p>{{ subject.teacherComment }}</p>
          <div class="summary-strip summary-strip--muted">
            <span>{{ subject.trimesterDelta }}</span>
            <span>{{ subject.yearOverYear }}</span>
            <span>{{ props.viewModel.grades.rankingEnabled ? (subject.ranking ?? 'Ranking hidden on this assessment') : 'Ranking disabled by school' }}</span>
          </div>
          <ul class="plain-list plain-list--tight">
            <li v-for="item in subject.breakdown" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Homework and assignments</p>
          <h2>Deadlines, files, and feedback</h2>
          <p>Submission status, parent nudges, and teacher feedback stay tied to each assignment.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span>{{ props.viewModel.homework.summary.submitted }} submitted</span>
          <span>{{ props.viewModel.homework.summary.pending }} pending</span>
          <span>{{ props.viewModel.homework.summary.late }} late</span>
        </div>
        <div v-if="props.viewModel.homework.parentAlerts.length" class="stack stack--compact">
          <article v-for="alert in props.viewModel.homework.parentAlerts" :key="alert" class="alert-item alert-item--warning">
            <div class="alert-item__icon">!</div>
            <div>
              <h3>Parent notification</h3>
              <p>{{ alert }}</p>
            </div>
          </article>
        </div>
        <div class="stack">
          <article v-for="item in props.viewModel.homework.items" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.subject }} · Due {{ formatTimestamp(item.dueAt) }}</p>
              </div>
              <span :class="statusPillClass(item.status)">{{ statusLabel(item.status) }}</span>
            </div>
            <div class="pill-row">
              <a v-for="asset in item.attachments" :key="asset.label" class="asset-pill" :href="asset.url" :target="asset.kind === 'link' ? '_blank' : undefined" :rel="asset.kind === 'link' ? 'noreferrer' : undefined">{{ asset.kind.toUpperCase() }} · {{ asset.label }}</a>
            </div>
            <p v-if="item.feedback">{{ item.feedback }}</p>
            <small v-if="item.submittedAt">Submitted {{ formatTimestamp(item.submittedAt) }}</small>
          </article>
        </div>

        <div class="homework-calendar">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Homework calendar</p>
            <h3>Deadline view by day</h3>
            <p>All assignment due dates are grouped in calendar order for quick planning.</p>
          </div>
          <div v-if="props.viewModel.homework.calendarDays.length" class="homework-calendar-grid">
            <article v-for="day in props.viewModel.homework.calendarDays" :key="day.dayKey" class="homework-calendar-day">
              <div class="homework-calendar-day__header">
                <h4>{{ day.dayLabel }}</h4>
                <span class="status-pill status-pill--neutral">{{ day.items.length }} due</span>
              </div>
              <div class="stack stack--compact">
                <article v-for="item in day.items" :key="item.id" class="list-card homework-calendar-item">
                  <div class="list-card__header">
                    <div>
                      <h3>{{ item.subject }}</h3>
                      <p>{{ item.title }}</p>
                    </div>
                    <span :class="statusPillClass(item.status)">{{ statusLabel(item.status) }}</span>
                  </div>
                  <small>Due {{ formatTimestamp(item.dueAt) }}</small>
                </article>
              </div>
            </article>
          </div>
          <p v-else class="module-note">No homework deadlines are scheduled yet.</p>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Exams</p>
          <h2>Schedule, syllabus, and results</h2>
          <p>Upcoming exams carry reminder dates, preparation resources, published results, and retake planning when needed.</p>
        </div>
        <div class="stack">
          <article v-for="item in props.viewModel.exams.items" :key="item.id" class="exam-card" :style="{ '--subject-accent': item.color }">
            <div class="exam-card__header">
              <div>
                <h3>{{ item.subject }}</h3>
                <p>{{ formatTimestamp(item.startsAt) }} · {{ item.room }}</p>
              </div>
              <span class="status-pill status-pill--warning">Reminder {{ item.reminderDate }}</span>
            </div>
            <ul class="plain-list plain-list--tight">
              <li v-for="topic in item.syllabus" :key="topic">{{ topic }}</li>
            </ul>
            <p v-if="item.result" class="module-note">{{ item.result }}</p>
            <p v-if="item.retake" class="module-note">{{ item.retake }}</p>
            <div class="pill-row">
              <a v-for="resource in item.resources" :key="resource.label" class="asset-pill" :href="resource.url" target="_blank" rel="noreferrer">Resource · {{ resource.label }}</a>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Attendance</p>
          <h2>Daily status and attendance history</h2>
          <p>Parents can track presence, lateness, justified status, and any configured academic impact from one place.</p>
        </div>
        <div class="summary-strip summary-strip--muted">
          <span :class="`badge-inline badge-inline--${props.viewModel.attendance.badge.tone}`">{{ props.viewModel.attendance.badge.label }}</span>
          <span>{{ props.viewModel.attendance.detail }}</span>
        </div>
        <p class="module-note">{{ props.viewModel.attendance.notification }}</p>
        <div class="stat-grid stat-grid--two">
          <article v-for="stat in props.viewModel.attendance.stats" :key="stat.label" class="stat-card">
            <p class="eyebrow">{{ stat.label }}</p>
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <p class="module-note">{{ props.viewModel.attendance.impact }}</p>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Absence reason</p>
          <h2>Send a parent note from the app</h2>
          <p>{{ props.viewModel.attendance.absenceGuidance }}</p>
        </div>
        <label class="field-stack">
          <span>Reason for absence or delay</span>
          <textarea v-model="absenceReason" class="input-textarea" rows="4" placeholder="Write a short message for the school office and class team."></textarea>
        </label>
        <button class="button button--primary" type="button" @click="submitAbsenceReason">Submit reason</button>
        <p v-if="absenceFeedback" class="form-message" :class="{ 'form-message--error': absenceFeedbackTone === 'error' }">{{ absenceFeedback }}</p>
        <div class="stack stack--compact attendance-history">
          <article v-for="item in props.viewModel.attendance.history" :key="item.id" class="list-card attendance-history__item">
            <div class="list-card__header">
              <h3>{{ item.dateLabel }}</h3>
              <span :class="attendanceHistoryClass(item.status)">{{ attendanceHistoryLabel(item.status) }}</span>
            </div>
            <p>{{ item.note }}</p>
            <small>{{ item.reason ? `${item.justified ? 'Justified' : 'Unjustified'} · ${item.reason}` : item.justified ? 'Present' : 'Unjustified' }}</small>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>

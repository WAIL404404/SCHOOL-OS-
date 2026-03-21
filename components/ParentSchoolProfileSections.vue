<script setup lang="ts">
import { motion } from 'motion-v'
import type { ParentSchoolProfileView, SchoolProfileCalendarEventRecord, SchoolProfileNewsArticleRecord } from '~/shared/app/types'

const props = defineProps<{ viewModel: ParentSchoolProfileView }>()
const emit = defineEmits<{ selectSchool: [schoolId: string] }>()

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

function calendarKindLabel(kind: SchoolProfileCalendarEventRecord['kind']) {
  if (kind === 'holiday') return 'Holiday'
  if (kind === 'exam') return 'Exam'
  if (kind === 'conference') return 'Conference'
  return 'Event'
}

function calendarKindClass(kind: SchoolProfileCalendarEventRecord['kind']) {
  if (kind === 'holiday') return 'status-pill status-pill--warning'
  if (kind === 'exam') return 'status-pill status-pill--alert'
  if (kind === 'conference') return 'status-pill status-pill--neutral'
  return 'status-pill'
}

function ratingStars(rating: number) {
  return '★'.repeat(Math.max(1, Math.min(5, Math.round(rating))))
}

function openShare(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function newsBadge(article: SchoolProfileNewsArticleRecord) {
  return `${article.category} · ${formatTimestamp(article.publishedAt)}`
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
      <div class="dashboard-hero-card__media">
        <img :src="props.viewModel.brand.logoUrl" :alt="`${props.viewModel.school.name} logo`" class="school-logo" />
      </div>
      <div class="dashboard-hero-card__content">
        <p class="eyebrow">School profile</p>
        <h2>{{ props.viewModel.school.name }}</h2>
        <p>{{ props.viewModel.school.campus }} · {{ props.viewModel.brand.slogan }}</p>
        <div class="summary-strip">
          <span>{{ props.viewModel.school.accent }} accent</span>
          <span>{{ props.viewModel.successStats[0]?.value ?? 'N/A' }} graduation</span>
          <span>{{ props.viewModel.news.length }} news post(s)</span>
        </div>
        <p class="dashboard-hero-card__highlight">Premium branding, calendar exports, and a public school story page are ready for family review.</p>
      </div>
      <div class="dashboard-hero-card__switcher">
        <p class="eyebrow">Switch school</p>
        <div class="child-switcher">
          <button
            v-for="school in props.viewModel.schoolTabs"
            :key="school.id"
            class="child-switcher__button"
            :class="{ 'child-switcher__button--active': school.isActive }"
            type="button"
            @click="emit('selectSchool', school.id)"
          >
            <span class="child-switcher__avatar" :style="{ background: school.accent }">{{ school.name.slice(0, 2) }}</span>
            <span>
              <strong>{{ school.name }}</strong>
              <small>{{ school.campus }}</small>
            </span>
          </button>
        </div>
      </div>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">At a glance</p>
        <h2>Brand and school health</h2>
        <p>White-label branding, campus identity, and reputation signals stay visible at the top of the module.</p>
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
        <div class="section-copy">
          <p class="eyebrow">12.1 School page</p>
          <h2>Logo, colors, and welcome story</h2>
          <p>Custom colors, welcome video, and the school narrative are ready for white-label presentation.</p>
        </div>
        <div class="two-column two-column--balanced two-column--secondary">
          <article class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Logo and colors</p>
              <h3>{{ props.viewModel.school.name }}</h3>
            </div>
            <img :src="props.viewModel.brand.logoUrl" :alt="`${props.viewModel.school.name} logo`" class="school-logo school-logo--large" />
            <div class="summary-strip summary-strip--muted">
              <span>Primary {{ props.viewModel.brand.primaryColor }}</span>
              <span>Secondary {{ props.viewModel.brand.secondaryColor }}</span>
            </div>
            <p class="module-note">{{ props.viewModel.brand.slogan }}</p>
          </article>

          <article class="panel-card panel-card--inner panel-card--soft">
            <div class="section-copy section-copy--tight">
              <p class="eyebrow">Welcome video</p>
              <h3>Campus introduction</h3>
            </div>
            <img :src="props.viewModel.brand.welcomeVideoPosterUrl" alt="Welcome video poster" class="school-hero-poster" />
            <p class="module-note">A short brand video is available for admissions and parent onboarding.</p>
            <a class="button button--primary" :href="props.viewModel.brand.welcomeVideoUrl" target="_blank" rel="noreferrer">Watch video</a>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Infrastructure gallery</p>
          <h3>Photos and virtual tour</h3>
        </div>
        <div class="subject-grid">
          <article v-for="item in props.viewModel.gallery" :key="item.id" class="subject-card">
            <img :src="item.url" :alt="item.label" style="width: 100%; border-radius: 18px; margin-bottom: 14px;" />
            <div class="subject-card__header">
              <div>
                <p class="eyebrow">{{ item.kind.replace('_', ' ') }}</p>
                <h3>{{ item.label }}</h3>
              </div>
            </div>
            <p>{{ item.caption }}</p>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Mission, vision, values</p>
          <h3>School identity</h3>
        </div>
        <div class="stack stack--compact">
          <article class="list-card">
            <h3>Mission</h3>
            <p>{{ props.viewModel.mission }}</p>
          </article>
          <article class="list-card">
            <h3>Vision</h3>
            <p>{{ props.viewModel.vision }}</p>
          </article>
          <article v-for="value in props.viewModel.values" :key="value.id" class="list-card">
            <h3>{{ value.label }}</h3>
            <p>{{ value.detail }}</p>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Teaching staff</p>
          <h2>Leadership, teachers, and family support</h2>
          <p>Staff profiles stay human, friendly, and visible so families know who is behind the school experience.</p>
        </div>
        <div class="stack">
          <article v-for="staff in props.viewModel.staff" :key="staff.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ staff.fullName }}</h3>
                <p>{{ staff.title }} · {{ staff.department }}</p>
              </div>
            </div>
            <div class="two-column two-column--balanced two-column--secondary" style="align-items: start;">
              <img :src="staff.photoUrl" :alt="staff.fullName" class="school-staff-avatar" />
              <div>
                <p>{{ staff.bio }}</p>
                <div class="pill-row">
                  <span v-for="specialty in staff.specialties" :key="specialty" class="status-pill status-pill--neutral">{{ specialty }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Certifications and accreditations</p>
          <h3>Quality signals</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.certifications" :key="item.id" class="alert-item alert-item--calm">
            <div class="alert-item__icon">•</div>
            <div>
              <h3>{{ item.label }}</h3>
              <p>{{ item.detail }}</p>
              <small>{{ item.issuer }}</small>
            </div>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Success statistics</p>
          <h3>Reputation by the numbers</h3>
        </div>
        <div class="stat-grid stat-grid--two">
          <article v-for="item in props.viewModel.successStats" :key="item.id" class="stat-card">
            <p class="eyebrow">{{ item.label }}</p>
            <h3>{{ item.value }}</h3>
            <p>{{ item.detail }}</p>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Parent testimonials</p>
          <h3>Family voice</h3>
        </div>
        <div class="stack stack--compact">
          <article v-for="item in props.viewModel.testimonials" :key="item.id" class="list-card">
            <div class="list-card__header">
              <div>
                <h3>{{ item.parentName }}</h3>
                <p>{{ item.relation }}</p>
              </div>
              <span class="status-pill status-pill--neutral">{{ ratingStars(item.rating) }}</span>
            </div>
            <p>{{ item.quote }}</p>
          </article>
        </div>

        <div class="section-copy section-copy--tight" style="margin-top: 18px;">
          <p class="eyebrow">Social links</p>
          <h3>External presence</h3>
        </div>
        <div class="pill-row">
          <a v-for="link in props.viewModel.socialLinks" :key="link.id" class="asset-pill" :href="link.url" target="_blank" rel="noreferrer">{{ link.platform }}</a>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">12.2 Academic calendar</p>
        <h2>Holidays, exams, conferences, and exports</h2>
        <p>The school calendar is ready for Google Calendar, Apple Calendar, iCal, and PDF-style downloads.</p>
      </div>
      <div class="summary-strip summary-strip--muted">
        <span>{{ props.viewModel.calendar.termLabel }}</span>
        <span>{{ props.viewModel.calendar.breaks.length }} break(s)</span>
        <span>{{ props.viewModel.calendar.items.filter((item) => item.kind === 'exam').length }} exam period(s)</span>
        <span>{{ props.viewModel.calendar.items.filter((item) => item.kind === 'conference').length }} conference date(s)</span>
      </div>
      <div class="two-column two-column--balanced two-column--secondary" style="margin-top: 18px;">
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Breaks</p>
            <h3>Term pauses</h3>
          </div>
          <div class="stack stack--compact">
            <article v-for="item in props.viewModel.calendar.breaks" :key="item" class="list-card">
              <h3>{{ item }}</h3>
            </article>
          </div>
        </section>
        <section class="panel-card panel-card--inner panel-card--soft">
          <div class="section-copy section-copy--tight">
            <p class="eyebrow">Downloads</p>
            <h3>Sync and export</h3>
          </div>
          <div class="pill-row">
            <a v-for="item in props.viewModel.calendar.downloads" :key="item.id" class="button button--secondary" :href="item.href" :target="item.kind === 'google' ? '_blank' : undefined" :rel="item.kind === 'google' ? 'noreferrer' : undefined" :download="item.kind === 'ical' || item.kind === 'pdf' ? `${props.viewModel.school.name}-calendar.${item.kind === 'pdf' ? 'pdf' : 'ics'}` : undefined">{{ item.label }}</a>
          </div>
        </section>
      </div>
      <div class="stack" style="margin-top: 18px;">
        <article v-for="item in props.viewModel.calendar.items" :key="item.id" class="list-card">
          <div class="list-card__header">
            <div>
              <p class="eyebrow">{{ formatDateRange(item.startsAt, item.endsAt) }}</p>
              <h3>{{ item.title }}</h3>
            </div>
            <span :class="calendarKindClass(item.kind)">{{ calendarKindLabel(item.kind) }}</span>
          </div>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">12.3 School news / blog</p>
        <h2>Stories, achievements, galleries, and sharing</h2>
        <p>School news articles combine photos, videos, and social sharing links so families can keep the school story alive.</p>
      </div>
      <div class="subject-grid">
        <article v-for="article in props.viewModel.news" :key="article.id" class="subject-card">
          <div class="subject-card__header">
            <div>
              <p class="eyebrow">{{ newsBadge(article) }}</p>
              <h3>{{ article.title }}</h3>
            </div>
          </div>
          <p>{{ article.summary }}</p>
          <p class="module-note">{{ article.body }}</p>
          <div v-if="article.media.length" class="pill-row">
            <a v-for="asset in article.media" :key="asset.id" class="asset-pill" :href="asset.url" :target="asset.kind === 'video' ? '_blank' : undefined" :rel="asset.kind === 'video' ? 'noreferrer' : undefined">{{ asset.kind }} · {{ asset.label }}</a>
          </div>
          <div class="pill-row" style="margin-top: 12px;">
            <button v-for="link in article.shareLinks" :key="link.id" class="button button--secondary" type="button" @click="openShare(link.url)">{{ link.platform }}</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import type { ParentDashboardView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: ParentDashboardView
}>()

const emit = defineEmits<{
  selectChild: [childId: string]
}>()
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
          <p class="eyebrow">Child overview</p>
          <h2>{{ props.viewModel.activeChild.fullName }}</h2>
          <p>{{ props.viewModel.activeChild.classLabel }} · {{ props.viewModel.activeChild.gradeLabel }} · {{ props.viewModel.activeChild.school.name }}</p>
          <div class="summary-strip">
            <span>{{ props.viewModel.summaryStrip.fees }}</span>
            <span>{{ props.viewModel.summaryStrip.events }}</span>
            <span>{{ props.viewModel.summaryStrip.transport }}</span>
          </div>
          <p class="dashboard-hero-card__highlight">{{ props.viewModel.activeChild.latestHighlight }}</p>
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
            <p class="eyebrow">Child overview</p>
            <h3>No child linked yet</h3>
            <p>Your parent account is active, but the school has not linked a student profile yet. Once the link is completed, this home screen will show the child's daily picture immediately.</p>
          </article>
        </div>
      </template>
    </motion.section>

    <section class="section-block section-block--topless">
      <div class="section-copy">
        <p class="eyebrow">Quick stats</p>
        <h2>Academic and daily signals</h2>
        <p>The most important indicators are visible immediately for the selected child.</p>
      </div>
      <div class="stat-grid stat-grid--three">
        <article v-for="stat in props.viewModel.quickStats" :key="stat.label" class="stat-card stat-card--showcase">
          <p class="eyebrow">{{ stat.label }}</p>
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.detail }}</p>
        </article>
      </div>
    </section>

    <section class="two-column two-column--balanced">
      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Alerts & action required</p>
          <h2>Things needing your attention</h2>
          <p>Fees, approvals, meetings, and study reminders are grouped in one calm place.</p>
        </div>
        <div class="stack">
          <article v-for="item in props.viewModel.alerts" :key="item.id" class="alert-item" :class="`alert-item--${item.tone}`">
            <div class="alert-item__icon">{{ item.tone === 'warning' ? '!' : item.tone === 'info' ? 'i' : '•' }}</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Today's schedule</p>
          <h2>Day plan</h2>
          <p>Today's classes and activities for the selected child.</p>
        </div>
        <div v-if="props.viewModel.schedule.length" class="schedule-strip">
          <span v-for="item in props.viewModel.schedule" :key="`${item.time}-${item.subject}`" class="schedule-pill">{{ item.time }} {{ item.subject }}</span>
        </div>
        <p v-else>No lessons scheduled yet.</p>
      </section>
    </section>

    <section class="three-up-grid">
      <article class="panel-card panel-card--compact">
        <p class="eyebrow">Transport status</p>
        <h3>{{ props.viewModel.transport.status }}</h3>
        <p>{{ props.viewModel.transport.detail }}</p>
        <span class="transport-pill">{{ props.viewModel.transport.toneLabel }}</span>
      </article>

      <article class="panel-card panel-card--compact">
        <p class="eyebrow">Latest school news</p>
        <h3>{{ props.viewModel.latestNews }}</h3>
        <p>Fresh communication appears here without opening a separate feed.</p>
      </article>

      <article class="panel-card panel-card--compact panel-card--achievement">
        <p class="eyebrow">Child's achievement</p>
        <h3>{{ props.viewModel.achievement }}</h3>
        <p>Positive recognition and milestones stay visible for the family.</p>
      </article>
    </section>

    <section class="two-column two-column--balanced two-column--secondary">
      <section class="panel-card">
        <div v-if="props.viewModel.complaintState.empty" class="panel-card panel-card--soft panel-card--inner">
          <p class="eyebrow">{{ props.viewModel.complaintState.title }}</p>
          <h3>Everything is currently on track</h3>
          <p>{{ props.viewModel.complaintState.description }}</p>
        </div>
        <div v-else class="stack">
          <div class="section-copy">
            <p class="eyebrow">{{ props.viewModel.complaintState.title }}</p>
            <h3>Open complaints and reclamations</h3>
            <p>{{ props.viewModel.complaintState.description }}</p>
          </div>
          <article v-for="item in props.viewModel.complaintState.items" :key="item.id" class="list-card">
            <div class="list-card__header">
              <h3>{{ item.title }}</h3>
              <span class="status-pill status-pill--alert">{{ item.status }}</span>
            </div>
            <p>{{ item.summary }}</p>
            <small>Opened {{ item.openedAt }}</small>
          </article>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-copy">
          <p class="eyebrow">Recent updates</p>
          <h2>Latest school communication</h2>
          <p>Important notices and teacher or school updates appear here first.</p>
        </div>
        <div class="stack">
          <article v-for="item in props.viewModel.recentUpdates" :key="item.id" class="list-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </section>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">Quick actions</p>
        <h2>Premium services rolling out next</h2>
        <p>These entry points give the MVP a clean path toward the broader school platform vision.</p>
      </div>
      <div class="action-grid">
        <NuxtLink v-for="item in props.viewModel.quickActions" :key="item.route" class="action-card" :to="item.route">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
          <span>Prepare module</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

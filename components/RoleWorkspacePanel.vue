<script setup lang="ts">
import type { RoleWorkspaceView } from '~/shared/app/types'

const props = defineProps<{
  viewModel: RoleWorkspaceView
}>()
</script>

<template>
  <div>
    <section class="hero-summary">
      <article class="hero-summary__card">
        <p class="eyebrow">Role foundation</p>
        <h3>{{ props.viewModel.title }}</h3>
        <p>{{ props.viewModel.description }}</p>
      </article>
      <article class="hero-summary__card hero-summary__card--accent">
        <p class="eyebrow">Access</p>
        <h3>{{ props.viewModel.roleLabel }}</h3>
        <p>{{ props.viewModel.school.name }}</p>
        <small>Role-based routing and seeded data are now active.</small>
      </article>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">Operational signals</p>
        <h2>Workspace metrics</h2>
        <p>This role now has a dedicated landing route, seed data, and a clear path for module-by-module development.</p>
      </div>
      <div class="metric-grid">
        <article v-for="metric in props.viewModel.metrics" :key="metric.label" class="metric-card">
          <p class="eyebrow">{{ metric.label }}</p>
          <h3>{{ metric.value }}</h3>
          <p>{{ metric.detail }}</p>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-copy">
        <p class="eyebrow">Next priorities</p>
        <h2>What this role will manage first</h2>
        <p>These placeholders keep the information architecture clean until each module is implemented in depth.</p>
      </div>
      <div class="priority-list">
        <article v-for="item in props.viewModel.priorities" :key="item" class="priority-card">
          <p>{{ item }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

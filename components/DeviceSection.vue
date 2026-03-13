<script setup lang="ts">
import type { ViewDevice } from '~/shared/app/types'

const props = defineProps<{
  devices: ViewDevice[]
}>()

const emit = defineEmits<{
  revoke: [deviceId: string]
}>()
</script>

<template>
  <section class="section-block">
    <div class="section-copy">
      <p class="eyebrow">Logged-in devices</p>
      <h2>Logged-in devices</h2>
      <p>Review trusted sessions connected to this account.</p>
      <small class="auth-note">Auto-logout after 15 minutes of inactivity</small>
    </div>
    <div class="device-grid">
      <article v-for="device in props.devices" :key="device.id" class="device-card">
        <div class="device-card__top">
          <div>
            <h3>{{ device.name }}</h3>
            <p>{{ device.location }}</p>
          </div>
          <span class="status-pill" :class="{ 'status-pill--neutral': !device.current }">{{ device.current ? 'Current device' : 'Trusted' }}</span>
        </div>
        <p>Last active: {{ device.lastActiveLabel }}</p>
        <button v-if="!device.current" class="text-button" type="button" @click="emit('revoke', device.id)">Remove device</button>
      </article>
    </div>
  </section>
</template>

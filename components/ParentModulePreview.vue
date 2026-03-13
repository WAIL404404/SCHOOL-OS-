<script setup lang="ts">
import { APP_ROUTES, navigationByRole } from '~/shared/app/data'

const props = defineProps<{
  activeRoute: string
}>()

const module = computed(() => navigationByRole.parent.find((item) => item.route === props.activeRoute))
</script>

<template>
  <section v-if="module && activeRoute !== APP_ROUTES.parentDashboard" class="section-block section-block--preview">
    <div class="section-copy">
      <p class="eyebrow">Module preview</p>
      <h2>{{ module.label }} is prepared for the next iteration</h2>
      <p>The information architecture is already in place for this parent module. For now, the dashboard remains the primary fully usable experience.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '~/shared/app/i18n'

const props = defineProps<{
  modelValue: SupportedLanguage
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SupportedLanguage]
}>()
</script>

<template>
  <div class="language-switcher" aria-label="Language selector">
    <span class="language-switcher__label">Language</span>
    <div class="language-switcher__buttons">
      <button
        v-for="item in SUPPORTED_LANGUAGES"
        :key="item.code"
        class="language-chip"
        :class="{ 'language-chip--active': item.code === props.modelValue }"
        type="button"
        @click="emit('update:modelValue', item.code)"
      >
        {{ item.nativeLabel }}
      </button>
    </div>
  </div>
</template>

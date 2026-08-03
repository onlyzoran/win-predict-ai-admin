<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import { locale } from '~/i18n'

useHead({
  titleTemplate: (title) => (title ? `${title} · Win Predict AI Admin` : 'Win Predict AI Admin'),
  htmlAttrs: {
    lang: () => locale.value,
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster rich-colors position="top-right" />
</template>

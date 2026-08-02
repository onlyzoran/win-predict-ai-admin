<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useHead({
  titleTemplate: (title) => (title ? `${title} · Win Predict Admin` : 'Win Predict Admin'),
  htmlAttrs: {
    lang: 'en',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster rich-colors position="top-right" />
</template>

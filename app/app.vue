<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useHead({
  titleTemplate: (title) => (title ? `${title} · Win Predict Admin` : 'Win Predict Admin'),
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <NuxtPage />
    <Toaster rich-colors position="top-right" />
  </div>
</template>

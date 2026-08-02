<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

await navigateTo('/tournaments')
</script>

<template>
  <div />
</template>

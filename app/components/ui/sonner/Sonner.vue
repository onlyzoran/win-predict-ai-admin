<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<{
  theme?: 'light' | 'dark' | 'system'
}>()
</script>

<template>
  <Sonner
    class="toaster group"
    :theme="props.theme || 'light'"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    }"
  />
</template>

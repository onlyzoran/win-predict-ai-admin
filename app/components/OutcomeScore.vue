<script setup lang="ts">
defineProps<{
  value: string
  variant: 'final' | 'intermediate'
}>()
</script>

<template>
  <span
    class="inline-flex min-w-14 items-center justify-center rounded-md px-2 py-0.5 tabular-nums text-xs font-semibold"
    :class="
      variant === 'final'
        ? 'bg-outcome-final text-outcome-final-foreground'
        : 'bg-outcome-intermediate text-outcome-intermediate-foreground'
    "
  >
    {{ value }}
  </span>
</template>

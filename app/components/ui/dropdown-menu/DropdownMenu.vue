<script setup lang="ts">
import { DropdownMenuRoot } from 'reka-ui'

defineProps<{
  modal?: boolean
}>()
</script>

<template>
  <DropdownMenuRoot data-slot="dropdown-menu" :modal="modal">
    <slot />
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
import { DropdownMenuTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <DropdownMenuTrigger data-slot="dropdown-menu-trigger" v-bind="$attrs">
    <slot />
  </DropdownMenuTrigger>
</template>

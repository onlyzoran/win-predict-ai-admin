<script setup lang="ts">
import { AvatarFallback } from "reka-ui"
</script>

<template>
  <AvatarFallback v-bind="$attrs">
    <slot />
  </AvatarFallback>
</template>

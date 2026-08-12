<script setup lang="ts">
import { AvatarImage } from "reka-ui"
</script>

<template>
  <AvatarImage v-bind="$attrs" class="h-full w-full object-cover">
    <slot />
  </AvatarImage>
</template>

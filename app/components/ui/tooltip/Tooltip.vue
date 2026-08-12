<script setup lang="ts">
import { TooltipRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps()
const emits = defineEmits()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <TooltipRoot v-bind="forwarded">
    <slot />
  </TooltipRoot>
</template>

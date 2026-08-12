<script setup lang="ts">
import { CollapsibleRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps()
const emits = defineEmits()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <CollapsibleRoot v-bind="forwarded">
    <slot />
  </CollapsibleRoot>
</template>

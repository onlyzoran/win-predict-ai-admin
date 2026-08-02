<script setup lang="ts">
import { DropdownMenuRadioGroup } from 'reka-ui'

const modelValue = defineModel<string>('modelValue')

function onUpdate(value: string | number | bigint | Record<string, unknown> | null) {
  if (typeof value === 'string') {
    modelValue.value = value
  }
}
</script>

<template>
  <DropdownMenuRadioGroup
    data-slot="dropdown-menu-radio-group"
    :model-value="modelValue"
    @update:model-value="onUpdate"
  >
    <slot />
  </DropdownMenuRadioGroup>
</template>

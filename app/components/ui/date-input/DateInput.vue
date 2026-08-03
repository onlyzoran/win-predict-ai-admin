<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import Input from '@/components/ui/input/Input.vue'

const props = defineProps<{
  defaultValue?: string
  modelValue?: string
  id?: string
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const { t } = useI18n()
const focused = ref(false)

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? '',
})

// Native date inputs ignore page lang and use the OS locale for empty-state
// placeholders (e.g. "дд.мм.гггг"). Show a text field with an i18n placeholder
// until the user focuses or a value is set.
const inputType = computed(() => (modelValue.value || focused.value ? 'date' : 'text'))
</script>

<template>
  <Input
    :id="id"
    v-model="modelValue"
    :type="inputType"
    :placeholder="t('form.datePlaceholder')"
    :class="props.class"
    @focus="focused = true"
    @blur="focused = false"
  />
</template>

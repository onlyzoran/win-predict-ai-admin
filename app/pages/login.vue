<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

definePageMeta({
  middleware: undefined,
})

const { t } = useI18n()
const { login, isAuthenticated, hydrate } = useGithubAuth()
const route = useRoute()

useHead({ title: () => t('login.title') })

const token = ref('')
const loading = ref(false)

hydrate()

watch(
  isAuthenticated,
  (value) => {
    if (value) {
      const callbackUrl = typeof route.query.callbackUrl === 'string'
        ? route.query.callbackUrl
        : '/tournaments'
      navigateTo(callbackUrl)
    }
  },
  { immediate: true },
)

async function onSubmit() {
  loading.value = true
  try {
    await login(token.value)
    const callbackUrl = typeof route.query.callbackUrl === 'string'
      ? route.query.callbackUrl
      : '/tournaments'
    await navigateTo(callbackUrl)
  }
  catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err
      ? (err as { statusCode?: number }).statusCode
      : undefined
    if (status === 401) {
      toast.error(t('login.invalidCredentials'))
    }
    else {
      toast.error(t('login.error'))
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
    <form
      class="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ t('app.title') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ t('login.subtitle') }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="token">{{ t('login.token') }}</Label>
        <Input
          id="token"
          v-model="token"
          type="password"
          autocomplete="off"
          required
        />
        <p class="text-xs text-muted-foreground">
          {{ t('login.tokenHint') }}
        </p>
      </div>

      <Button type="submit" class="w-full" :disabled="loading">
        {{ loading ? t('login.submitting') : t('login.submit') }}
      </Button>
    </form>
  </div>
</template>

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
const { requestMagicLink, isAuthenticated, ensureHydrated } = useAuth()
const route = useRoute()

useHead({ title: () => t('login.title') })

const email = ref('')
const loading = ref(false)
const sent = ref(false)

await ensureHydrated()

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
  sent.value = false
  try {
    await requestMagicLink(email.value)
    sent.value = true
    toast.success(t('login.linkSent'))
  }
  catch {
    toast.error(t('login.error'))
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
        <Label for="email">{{ t('login.email') }}</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
        />
        <p class="text-xs text-muted-foreground">
          {{ t('login.emailHint') }}
        </p>
      </div>

      <p v-if="sent" class="text-sm text-muted-foreground">
        {{ t('login.checkInbox') }}
      </p>

      <Button type="submit" class="w-full" :disabled="loading">
        {{ loading ? t('login.submitting') : t('login.submit') }}
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/tournaments',
  },
})

const { t } = useI18n()

useHead({ title: () => t('login.title') })

const { signIn, status } = useAuth()
const email = ref('')
const password = ref('')
const loading = ref(false)
const route = useRoute()

watch(
  status,
  (value) => {
    if (value === 'authenticated') {
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
    const callbackUrl = typeof route.query.callbackUrl === 'string'
      ? route.query.callbackUrl
      : '/tournaments'

    const result = await signIn('credentials', {
      email: email.value,
      password: password.value,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      toast.error(t('login.invalidCredentials'))
      return
    }

    const { getSession } = useAuth()
    await getSession()
    await navigateTo(callbackUrl)
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
          autocomplete="username"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">{{ t('login.password') }}</Label>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <Button type="submit" class="w-full" :disabled="loading">
        {{ loading ? t('login.submitting') : t('login.submit') }}
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'

definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/tournaments',
  },
})

useHead({ title: 'Вход' })

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
      toast.error('Неверный email или пароль')
      return
    }

    const { getSession } = useAuth()
    await getSession()
    await navigateTo(callbackUrl)
  }
  catch {
    toast.error('Ошибка входа')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <form
      class="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">
          Win Predict Admin
        </h1>
        <p class="text-sm text-muted-foreground">
          Войдите, чтобы управлять турнирами
        </p>
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">Пароль</Label>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>

      <Button type="submit" class="w-full" :disabled="loading">
        {{ loading ? 'Вход…' : 'Войти' }}
      </Button>
    </form>
  </div>
</template>

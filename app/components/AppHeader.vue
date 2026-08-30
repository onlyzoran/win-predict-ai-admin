<script setup lang="ts">
import { AppHeaderShell, BrandTitle } from '@onlyzoran/win-predict-ai-ui'
import { IconLogout } from '@onlyzoran/win-predict-ai-icons'
import { useI18n } from 'vue-i18n'
import { locale, localeLabels, locales, setLocale, type Locale } from '~/i18n'

const { t } = useI18n()
const route = useRoute()
const { isAuthenticated, logout: signOut, ensureHydrated } = useAuth()
ensureHydrated()

function onLocaleUpdate(code: string) {
  if (locales.includes(code as Locale)) setLocale(code as Locale)
}

async function logout() {
  await signOut()
  await navigateTo('/login')
}

function navClass(path: string) {
  const active = route.path === path || route.path.startsWith(`${path}/`)
  return [
    'rounded-md px-2 py-1.5 text-sm transition-colors',
    active
      ? 'bg-accent text-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  ]
}
</script>

<template>
  <AppHeaderShell
    :locale="locale"
    :locales="locales"
    :locale-labels="localeLabels"
    :locale-aria-label="t('language.label')"
    :theme-aria-label-light="t('theme.switchToLight')"
    :theme-aria-label-dark="t('theme.switchToDark')"
    github-url="https://github.com/onlyzoran/win-predict-ai-admin"
    @update:locale="onLocaleUpdate"
  >
    <template #brand>
      <BrandTitle suffix=" Admin" />
    </template>
    <template v-if="isAuthenticated" #actions>
      <nav class="mr-1 flex items-center gap-1">
        <NuxtLink to="/tournaments" :class="navClass('/tournaments')">
          {{ t('nav.tournaments') }}
        </NuxtLink>
        <NuxtLink to="/sports" :class="navClass('/sports')">
          {{ t('nav.sports') }}
        </NuxtLink>
        <NuxtLink to="/admins" :class="navClass('/admins')">
          {{ t('nav.admins') }}
        </NuxtLink>
      </nav>
      <button
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        @click="logout"
      >
        <IconLogout :size="16" />
        {{ t('common.logout') }}
      </button>
    </template>
  </AppHeaderShell>
</template>

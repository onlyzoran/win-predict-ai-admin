<script setup lang="ts">
import { AppHeaderShell } from '@onlyzoran/win-predict-ai-ui'
import { IconLogout } from '@onlyzoran/win-predict-ai-icons'
import { useI18n } from 'vue-i18n'
import { locale, localeLabels, locales, setLocale, type Locale } from '~/i18n'

const { t } = useI18n()
const { isAuthenticated, logout: signOut, hydrate } = useGithubAuth()
hydrate()

function onLocaleUpdate(code: string) {
  if (locales.includes(code as Locale)) setLocale(code as Locale)
}

async function logout() {
  signOut()
  await navigateTo('/login')
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
      <span class="font-semibold text-foreground">{{ t('app.title') }}</span>
    </template>
    <template v-if="isAuthenticated" #actions>
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

<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import {
  IconBrandGithub,
  IconLogout,
  IconMoon,
  IconSun,
} from '@onlyzoran/win-predict-ai-icons'
import { locale, localeLabels, locales, setLocale, type Locale } from '~/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { t } = useI18n()
const { isAuthenticated, logout: signOut, hydrate } = useGithubAuth()
hydrate()

const mode = useColorMode({
  modes: {
    auto: '',
    light: '',
    dark: 'dark',
  },
})
const isDark = computed(() => mode.state.value === 'dark')

function toggleTheme() {
  mode.value = isDark.value ? 'light' : 'dark'
}

function onLocaleChange(value: string) {
  if (locales.includes(value as Locale)) {
    setLocale(value as Locale)
  }
}

async function logout() {
  signOut()
  await navigateTo('/login')
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-6 shadow-sm backdrop-blur-md"
  >
    <span class="font-semibold text-foreground">{{ t('app.title') }}</span>
    <div class="flex items-center gap-1">
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger
          class="rounded-md px-2 py-1 text-sm font-medium uppercase text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          :aria-label="t('language.label')"
        >
          {{ locale }}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup :model-value="locale" @update:model-value="onLocaleChange">
            <DropdownMenuRadioItem v-for="code in locales" :key="code" :value="code">
              <span class="w-6 uppercase text-muted-foreground">{{ code }}</span>
              {{ localeLabels[code] }}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        class="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        :class="
          isDark
            ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
            : 'border-zinc-300 bg-zinc-100 text-zinc-500'
        "
        :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
        @click="toggleTheme"
      >
        <span
          class="pointer-events-none absolute top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full transition-[left,right,background-color,color,box-shadow] duration-200"
          :class="
            isDark
              ? 'right-0.5 left-auto bg-zinc-950 text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]'
              : 'left-0.5 right-auto bg-white text-zinc-500 shadow-[0_2px_8px_rgba(15,23,42,0.18)]'
          "
        >
          <IconMoon v-if="isDark" class="size-3.5" :stroke="2" />
          <IconSun v-else class="size-3.5" :stroke="2" />
        </span>
      </button>
      <span class="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <a
        href="https://github.com/onlyzoran/win-predict-ai-admin"
        target="_blank"
        rel="noreferrer"
        class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="GitHub"
      >
        <IconBrandGithub :size="16" aria-hidden="true" />
      </a>
      <template v-if="isAuthenticated">
        <span class="mx-1 h-5 w-px bg-border" aria-hidden="true" />
        <button
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          @click="logout"
        >
          <IconLogout :size="16" />
          {{ t('common.logout') }}
        </button>
      </template>
    </div>
  </header>
</template>

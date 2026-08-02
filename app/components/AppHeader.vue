<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { locale, localeLabels, locales, setLocale, type Locale } from '~/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { t } = useI18n()

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
        class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
    </div>
  </header>
</template>

import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

/** Единственная палитра admin — Claude+ из UI-пакета. */
export const ADMIN_PALETTE = 'claude-plus' as const

export function resolveIsDark(mode: string): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyAdminPalette() {
  document.documentElement.setAttribute('data-palette', ADMIN_PALETTE)
}

export function useColorPalette() {
  const mode = useColorMode()
  const isDark = computed(() => resolveIsDark(mode.value))

  applyAdminPalette()

  return { isDark, mode }
}

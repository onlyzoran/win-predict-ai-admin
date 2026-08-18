import { PALETTES, type Palette } from '@onlyzoran/win-predict-ai-ui'
import { useStorage } from '@vueuse/core'

/** localStorage key — синхронизирован с FOUC-скриптом в nuxt.config.ts */
export const PALETTE_STORAGE_KEY = 'win-predict-palette'

/** Палитра по умолчанию для admin после интеграции pastel (win-predict-ai-admin#9). */
export const ADMIN_DEFAULT_PALETTE: Palette = 'pastel'

export function applyPalette(palette: Palette) {
  document.documentElement.setAttribute('data-palette', palette)
}

export function useColorPalette() {
  const palette = useStorage<Palette>(PALETTE_STORAGE_KEY, ADMIN_DEFAULT_PALETTE)

  watch(
    palette,
    (value) => {
      if (PALETTES.includes(value)) {
        applyPalette(value)
      }
    },
    { immediate: true },
  )

  function setPalette(next: Palette) {
    palette.value = next
  }

  return {
    palette,
    palettes: PALETTES,
    setPalette,
  }
}

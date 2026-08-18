import { DEFAULT_PALETTE } from '@onlyzoran/win-predict-ai-ui'

export default defineNuxtPlugin(() => {
  document.documentElement.setAttribute('data-palette', DEFAULT_PALETTE)
})

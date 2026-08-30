// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const nexoraThemePath = fileURLToPath(new URL('./app/assets/css/nexora.css', import.meta.url))
const uiComponentStylesPath = fileURLToPath(
  new URL('./node_modules/@onlyzoran/win-predict-ai-ui/dist/win-predict-ai-ui.css', import.meta.url),
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
  ],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  runtimeConfig: {
    // Override at runtime with NUXT_* env vars (see .env.example)
    databasePath: '.data/admin.sqlite',
    adminEmails: '',
    resendApiKey: '',
    mailFrom: 'onboarding@resend.dev',
    appUrl: 'http://localhost:3000',
    sessionSecret: 'dev-secret-change-me',
    apiPort: '3001',
    public: {},
  },

  nitro: {
    externals: {
      external: ['better-sqlite3'],
    },
  },

  pinia: {
    storesDirs: ['app/stores'],
  },

  typescript: {
    strict: true,
  },

  vite: {
    resolve: {
      alias: {
        // UI #37: nexora пока Storybook-only — alias до экспорта themes/nexora.css в npm
        '@onlyzoran/win-predict-ai-ui/themes/nexora.css': nexoraThemePath,
        // BrandTitle scoped styles — dist/win-predict-ai-ui.css не в package exports
        '@onlyzoran/win-predict-ai-ui/component-styles.css': uiComponentStylesPath,
      },
    },
    vue: {
      script: {
        fs: {
          fileExists: (file: string) => fs.existsSync(file),
          readFile: (file: string) => fs.readFileSync(file, 'utf-8'),
        },
      },
    },
  },
})

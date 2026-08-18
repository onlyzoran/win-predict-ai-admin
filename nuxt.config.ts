// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'

const PALETTE_STORAGE_KEY = 'win-predict-palette'
const ADMIN_DEFAULT_PALETTE = 'pastel'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      script: [
        {
          key: 'theme-init',
          innerHTML: `(function(){try{var paletteRaw=localStorage.getItem('${PALETTE_STORAGE_KEY}');var palette=paletteRaw?JSON.parse(paletteRaw):'${ADMIN_DEFAULT_PALETTE}';var schemeRaw=localStorage.getItem('vueuse-color-scheme');var preference=schemeRaw?JSON.parse(schemeRaw):'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=preference==='dark'||(preference!=='light'&&prefersDark);document.documentElement.classList.toggle('dark',isDark);document.documentElement.setAttribute('data-palette',palette)}catch(_){}})();`,
          type: 'text/javascript',
        },
      ],
    },
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

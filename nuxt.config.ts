// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const uiPackageRoot = path.dirname(require.resolve('@onlyzoran/win-predict-ai-ui'))

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
          innerHTML: `(function(){try{var schemeRaw=localStorage.getItem('vueuse-color-scheme');var preference=schemeRaw?JSON.parse(schemeRaw):'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=preference==='dark'||(preference!=='light'&&prefersDark);document.documentElement.classList.toggle('dark',isDark);document.documentElement.setAttribute('data-palette','claude-plus')}catch(_){}})();`,
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
    resolve: {
      alias: {
        // До publish UI-пакета с export ./themes/claude-plus.css (см. win-predict-ai-ui#10).
        '@onlyzoran/win-predict-ai-ui/themes/claude-plus.css': path.join(
          uiPackageRoot,
          '../src/themes/claude-plus.css',
        ),
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

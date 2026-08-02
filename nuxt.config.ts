// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
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

  auth: {
    // Path to NuxtAuthHandler. AUTH_ORIGIN (full URL incl. /api/auth) overrides at runtime.
    baseURL: '/api/auth',
    originEnvKey: 'AUTH_ORIGIN',
    disableServerSideAuth: false,
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: false,
  },

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || '',
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    databaseUrl: process.env.DATABASE_URL || 'file:./data/admin.sqlite',
  },

  nitro: {
    externals: {
      traceInclude: ['node_modules/better-sqlite3/**'],
    },
  },

  pinia: {
    storesDirs: ['app/stores'],
  },

  typescript: {
    strict: true,
  },
})

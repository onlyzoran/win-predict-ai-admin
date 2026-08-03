// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/win-predict-ai-admin/',
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
    public: {
      githubOwner: process.env.NUXT_PUBLIC_GITHUB_OWNER || 'onlyzoran',
      githubRepo: process.env.NUXT_PUBLIC_GITHUB_REPO || 'win-predict-ai-data',
      githubPath: process.env.NUXT_PUBLIC_GITHUB_PATH || 'data/leagues.json',
      githubBranch: process.env.NUXT_PUBLIC_GITHUB_BRANCH || 'main',
    },
  },

  nitro: {
    preset: 'static',
  },

  pinia: {
    storesDirs: ['app/stores'],
  },

  typescript: {
    strict: true,
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@vee-validate/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
    },
  },

  colorMode: {
    classSuffix: '',
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  // Development server configuration
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  // Vite configuration for Docker hot reload
  vite: {
    server: {
      hmr: {
        port: 24678,
        clientPort: 24678,
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  },

  // Nitro configuration for Docker
  nitro: {
    devServer: {
      watch: [],
    },
  },
})
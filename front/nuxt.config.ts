// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
      app: {
          API_URL: process.env.API_URL || 'http://localhost/api'
      },
  },
  css: [
      'vuetify/lib/styles/main.sass',
      '@mdi/font/css/materialdesignicons.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  modules: [
      '@pinia/nuxt',
      'nuxt-socket-io'
  ],
  plugins: [
      '~/plugins/vuetify.plugin.ts',
      '~/plugins/auth.plugin.ts',
      '~/plugins/mitt.plugin.ts',
      '~/plugins/api.plugin.ts',
      '~/plugins/websockets.plugin.ts'
  ],
  ssr: false,
  io: {
    sockets: [{
      name: 'chat',
      url: process.env.WS_BASE_URL || 'ws://localhost/',
    }]
  }
})
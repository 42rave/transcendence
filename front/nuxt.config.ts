// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
      app: {
          API_URL: process.env.API_URL || 'http://localhost:3000'
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
      '~/plugins/websockets.plugin.ts',
      '~/plugins/mitt.plugin.ts'
  ],
  ssr: false,
  io: {
    sockets: [{
      name: 'chat',
      url: process.env.API_URL || 'http://localhost:3000',
    }]
  }
})
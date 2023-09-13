// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
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
      '~/plugins/vuetify.ts',
      '~/plugins/auth.ts',
      '~/plugins/mitt.ts'
  ],
  ssr: false,
  io: {
    sockets: [{
      name: 'main',
      url: 'http://localhost:3000',
    }]
  }
})
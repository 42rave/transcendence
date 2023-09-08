// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.css'],
  build: { transpile: ['vuetify'] },
  modules: ['@pinia/nuxt'],
  plugins: ['~/plugins/vuetify.ts', '~/plugins/auth.ts'],
  ssr: false,
})
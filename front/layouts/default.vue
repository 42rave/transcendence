<script lang="ts">
import { useAuthStore } from "~/stores/auth";

export default defineNuxtComponent({
  name: 'DefaultLayout',
  data() {
    return {
      drawer: true,
      routes: {
        home: {
          name: 'Home',
          path: '/',
          icon: 'mdi-home',
        },
        about: {
          name: 'About',
          path: '/about',
          icon: 'mdi-information',
        },
      },
    }
  },
  head() {
    return {
      title: useAuthStore().isAuthenticated ? '42Rave' : 'Login',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    }
  },
})
</script>

<template>
  <v-app dark>
    <div v-if="$auth.isAuthenticated" class="w-100 h-100">
      <LayoutAppBar @onDrawerClick="drawer = !drawer" />
      <LayoutNavBar :drawer="drawer" :routes="routes" />
      <v-main>
        <v-container fluid>
          <slot />
        </v-container>
      </v-main>
    </div>
    <div v-else>
      <WidgetLogin />
    </div>
  </v-app>
</template>

<style scoped>
.nuxt-link {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  width: 100%;
}
.v-list-item {
  padding: unset !important;
}
.v-list-item__content {
  height: 100% !important;
}
</style>
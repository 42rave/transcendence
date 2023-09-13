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
          name: 'Chat',
          path: '/chat',
          icon: 'mdi-chat',
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
      <LayoutAppBar @drawer:click="drawer = !drawer" />
      <LayoutNavBar @drawer:update="(v: boolean) => drawer = v" :drawer="drawer" :routes="routes" />
      <v-main>
        <v-container fluid>
          <slot />
        </v-container>
      </v-main>
      <LayoutAlert />
    </div>
    <div v-else>
      <WidgetLogin />
    </div>
  </v-app>
</template>

<style scoped>
.v-container {
  padding: 0;
  height: inherit;
  display: flex;
  flex-direction: column;
}
.v-main {
  height: 100%;
}
</style>
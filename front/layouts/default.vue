<script lang="ts">
import { useAuthStore } from "~/stores/auth.store";
import { NuxtSocket } from "nuxt-socket-io";

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
      socket: null as NuxtSocket | null,
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
  beforeMount() {
    console.log('beforeMount: ', this.$config.app.API_URL);
    this.socket = this.$nuxtSocket({
      name: 'chat',
      channel: 'chat',
      withCredentials: true,
      persist: 'chatSocket',
    });
    this.socket.on('connect', () => {
      this.$sockets.chatConnected = true;
    });
    this.socket.on('disconnect', () => {
      this.$sockets.chatConnected = false;
    });
  },
})
</script>

<template>
  <v-app dark>
    <div v-if="$auth.isAuthenticated && (!$auth.user.twoFAEnabled || $auth.user.twoFALogged)" class="w-100 h-100">
      <LayoutAppBar @drawer:click="drawer = !drawer" :socket="socket" />
      <LayoutNavBar @drawer:update="(v: boolean) => drawer = v" :drawer="drawer" :routes="routes" />
      <v-main>
        <v-container fluid>
          <NuxtPage :socket="socket"/>
        </v-container>
      </v-main>
      <LayoutAlert />
    </div>
    <div v-else-if="$auth.isAuthenticated && $auth.user.twoFAEnabled && !$auth.user.twoFALogged">
      <WidgetTotpLogin :socket="socket" />
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
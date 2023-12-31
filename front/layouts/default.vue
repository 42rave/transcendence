<script lang="ts">
import { useAuthStore } from "~/stores/auth.store";
import { NuxtSocket } from "nuxt-socket-io";

export default defineNuxtComponent({
  name: 'DefaultLayout',
  data() {
    return {
      drawer: false,
      routes: {
        home: {
          name: 'Home',
          path: '/',
          icon: 'mdi-account',
        },
        about: {
          name: 'Chat',
          path: '/chat',
          icon: 'mdi-chat',
        },
        game: {
          name: 'Game',
          path: '/game',
          icon: 'mdi-gamepad-variant',
        }
      },
      loading: true,
      socket: null as NuxtSocket | null,
      gameSocket: null as NuxtSocket | null,
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
  async beforeMount() {
    await this.$auth.fetchUser();
    this.loading = false;
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
    this.gameSocket = this.$nuxtSocket({
      name: 'game',
      channel: 'game',
      withCredentials: true,
      persist: 'gameSocket',
    });
    this.gameSocket.on('connect', () => {
      this.$sockets.gameConnected = true;
    });
    this.gameSocket.on('disconnect', () => {
      this.$sockets.gameConnected = false;
    });
  },
})
</script>

<template>
  <v-app dark>
    <div v-if="loading" class="w-100">
      <v-progress-linear indeterminate color="white" />
    </div>
    <div v-else-if="$auth.isAuthenticated && (!$auth.user.twoFAEnabled || $auth.user.twoFALogged)" class="w-100 h-100">
      <LayoutAppBar @drawer:click="drawer = !drawer" :socket="socket" />
      <LayoutNavBar @drawer:update="(v: boolean) => drawer = v" :drawer="drawer" :routes="routes" />
      <v-main>
        <v-container fluid>
          <NuxtPage :socket="socket" :gameSocket="gameSocket"/>
        </v-container>
      </v-main>
    </div>
    <div v-else-if="$auth.isAuthenticated && $auth.user.twoFAEnabled && !$auth.user.twoFALogged">
      <WidgetTotpLogin :socket="socket" />
    </div>
    <div v-else>
      <WidgetLogin />
    </div>
    <LayoutAlert />
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
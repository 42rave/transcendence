<template>
  <ChatBox v-if="connected" :socket="socket" />
  <div class="ma-auto d-flex flex-column" v-else>
    <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
    Connecting
  </div>
</template>

<script lang="ts">
import { NuxtSocket } from 'nuxt-socket-io';

export default defineNuxtComponent({
  name: 'About',
  data: () => ({
    socket: null as NuxtSocket,
    connected: false,
  }),
  mounted() {
    this.connect();
  },
  unmounted() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
  },
  methods: {
    connect() {
      // instantiate socket
      this.socket = this.$nuxtSocket({
        name: 'chat',
        channel: 'chat',
        withCredentials: true,
      })

      // Add connection listeners
      this.socket.on('connect', () => {
        console.log('connected');
        this.connected = true;
      });
      this.socket.on('disconnect', (event: string) => {
        this.connected = false;
        if (event !== 'io server disconnect')
          this.connect();
      });
      // end of connection listeners
    },
  }
})
</script>
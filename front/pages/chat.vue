<script lang="ts">
interface IChannel {
  name: string;
  owner: string;
}
export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    rail: true,
    tab: "channels",
    channelList: Array<IChannel>(),
     config: useRuntimeConfig(),
  }),
  mounted () {
    this.displayChannels();
  },
  methods: {
    async displayChannels() {
      console.log("bouh");
      
      const channels = await $fetch(new URL('/chat/channel', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'GET',
      }).catch();
      this.channelList = channels;
      console.log(channels);
      
    }
  }
})
</script>

<template>
  <div class="parent">
    <ChatBox v-if="$sockets.isChatConnected" :socket="socket" />
    <div class="ma-auto d-flex flex-column" v-else>
      <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
        Connecting
    </div>


  </div>
</template>


<style>
.drawer__icon {
  align-item: end;
  width: 50px;

}
</style>
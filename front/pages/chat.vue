<script lang="ts">
interface IChannel {
  name: string;
  owner: string;
}
export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
    channelList: Array<IChannel>()
  }),
  methods: {
    displayChannels() {
      console.log("bouh");
      
      const channels = $fetch(new URL('/chat/channel', this.config.app.API_URL).toString(), {
        credentials: 'include',
        method: 'GET',
      });
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
    <div class="channel_card">
      Available channels
      <v-btn @click="displayChannels"> SHOW CHANNELS </v-btn>
      <ul>
        this is a list of the channels
        <li v-for="channel in channels" :key="channel.id">
        ({{channel.name}})
        </li>
      </ul>
    </div>
  </div>
</template>


<style>
.parent {
  display: grid;
  grid-template-columns: 5fr 3fr;
}

.channel_card {
  height: 1000px;
  padding: 16px;
  background: grey; 
}
</style>
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

  methods: {

  }
})
</script>

<template>
  <LayoutChatBar/>
  <div class="chatPage">
    <ChatBox v-if="$sockets.isChatConnected" :socket="socket" />
    <div class="ma-auto d-flex flex-column" v-else>
      <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
        Connecting
    </div>


  </div>
</template>


<style>
.chatPage {
  width: auto;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

</style>
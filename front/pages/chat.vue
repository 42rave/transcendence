<script lang="ts">

export default defineNuxtComponent({
  props: ['socket', 'gameSocket'],
  data: () => ({
     config: useRuntimeConfig(),
  }),
})
</script>

<template>
  <div class="chatPage">
    <ChatBox v-if="$sockets.isChatConnected && $sockets.isGameConnected" :socket="socket" :gameSocket="gameSocket"/>
    <div class="ma-auto d-flex flex-column" v-else>
      <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
        Connecting
    </div>
  </div>



</template>


<style>
.chatPage {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

</style>
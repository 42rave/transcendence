<template>
  <ChatBox v-if="$sockets.isChatConnected" :socket="socket" />
  <div class="ma-auto d-flex flex-column" v-else>
    <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
    Connecting
  </div>
</template>

<script lang="ts">
export default defineNuxtComponent({
  props: ['socket'],
})
</script>
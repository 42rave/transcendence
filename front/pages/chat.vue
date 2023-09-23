<script lang="ts">

export default defineNuxtComponent({
  props: ['socket'],
  data: () => ({
     config: useRuntimeConfig(),
  }),

  methods: {

  }
})
</script>

<template>
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
  justify-content: center;
}

</style>
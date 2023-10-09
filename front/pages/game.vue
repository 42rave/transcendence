<script lang='ts'>
export default defineNuxtComponent({
  props: ['gameSocket'],
})
</script>

<template>
  <div v-if="this.$sockets.gameConnected" class="gamePage">
    <div id="game-container">
      <GamePlay :socket='this.gameSocket' :left='true' />
    </div>
  </div>
  <div class="ma-auto d-flex flex-column" v-else>
    <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
    Connecting
  </div>
</template>

<style scoped>
#game-container {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: calc(100vh - 64px);
  display: grid;
}
.gamePage {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
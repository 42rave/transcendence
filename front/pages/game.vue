<script lang='ts'>
export default defineNuxtComponent({
  props: ['gameSocket'],
})
</script>

<template>
  <div v-if="this.$sockets.gameConnected" id="game-container">
    <GameTest :socket='this.gameSocket' />
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
</style>
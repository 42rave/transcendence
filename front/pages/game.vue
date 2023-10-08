<script lang='ts'>
export default defineNuxtComponent({
  props: ['gameSocket'],
})
</script>

<template>
  <div id="game-container">
    <GamePlay :socket='this.gameSocket' :left='true' />
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
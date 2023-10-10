<script lang='ts'>
export default defineNuxtComponent({
  props: ['gameSocket'],
  data: () => ({
    status: 0,
    left: true,
    win: false,
  }),
  mounted() {
    this.gameSocket.on('game:queueing', () => {
      this.status = 1;
    });
    this.gameSocket.on('game:start', ({ side }: { side: 'right' | 'left'}) => {
      this.status = 2;
      this.left = side === 'left';
    });
    this.gameSocket.on('game:finished', ({win}: {win: boolean}) => {
      this.win = win;
      this.status = 3;
    });
  },
  unmounted() {
    this.gameSocket.off('game:queueing');
    this.gameSocket.off('game:start');
    this.gameSocket.off('game:finished');
  },
  methods: {
    gameConnect() {
      this.status = 1;
      this.gameSocket.emit('game:queueing');
    }
  }
})
</script>

<template>
  <div v-if="this.$sockets.gameConnected" class="gamePage">
    <div v-if='status === 3'>
      <GameFinished @dismiss="() => { this.status = 0; this.win = false }" :win='this.win' />
    </div>
    <div id="game-container" v-else-if="status === 2">
      <GamePlay :socket='this.gameSocket' :left='this.left' />
    </div>
    <div v-else-if="status === 1">
      <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
      Connecting
    </div>
    <v-btn v-else @click="gameConnect" color="purple" dark>Connect</v-btn>
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
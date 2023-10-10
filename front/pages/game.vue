<script lang='ts'>
export default defineNuxtComponent({
  props: ['gameSocket'],
  data: () => ({
    status: 0,
    left: true,
    win: false,
    player_names: {
      left: '',
      right: '',
    }
  }),
  mounted() {
    this.gameSocket.on('game:queueing', () => {
      this.status = 1;
    });
    this.gameSocket.on('game:start', ({ side, p1_name, p2_name }: { side: 'right' | 'left', p1_name: string, p2_name: string}) => {
      this.status = 2;
      this.left = side === 'left';
      this.player_names.left = p1_name;
      this.player_names.right = p2_name;
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
      <GamePlay :socket='this.gameSocket' :left='this.left' :player_left='this.player_names.left' :player_right='this.player_names.right' />
    </div>
    <div v-else>
      <div class="status-content w-100 h-100 ma-auto">
        <v-card>
          <v-card-title class="text-center">
            <h3 class='display-1'>Search a game</h3>
          </v-card-title>
          <v-card-text class="text-center">
            <v-btn @click="gameConnect" color="purple" dark>Connect</v-btn>
          </v-card-text>
          <div v-if='this.status ==1' class='d-flex flex-column'>
            <v-progress-circular class="ma-auto" indeterminate size="64" color="purple" />
            <div class='ma-auto'>Connecting</div>
          </div>
        </v-card>
      </div>
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
.status-content {
  max-width: 512px;
}
</style>
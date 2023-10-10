<script  lang='ts'>
export default defineNuxtComponent({
  props: ['win'],
  emits: ['dismiss'],
  data: () => ({
    winText: 'Wow, such a gamer, you win!',
    loseText: 'Oh Nooo! you lose!',
    counter: 10
  }),
  methods: {
    getWinStatus() {
      return this.win ? 'success' : 'error';
    }
  },
  async mounted() {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        this.counter--;
        if (this.counter <= 0) {
          clearInterval(interval);
          resolve(null);
        }
      }, 1000);
    });
    this.$emit('dismiss');
  }
})
</script>

<template>
  <div class="status-content w-100 h-100 ma-auto">
    <v-card>
      <v-card-title class="text-center">
        <h3 class="display-1" :class='this.getWinStatus()'>{{ this.win ? this.winText : this.loseText }}</h3>
      </v-card-title>
      <div class="text-center" :class='this.getWinStatus()'>
        <v-icon v-if="this.win" size='75px'>mdi-emoticon-happy-outline</v-icon>
        <v-icon v-else size='75px'>mdi-emoticon-sad-outline</v-icon>
      </div>

      <v-card-text class="text-center">
        <h3 class="display-1">Redirecting.. ({{ this.counter }}s)</h3>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.status-content {
  max-width: 512px;
}
.success {
  color: #54cb54;
}
.error {
  color: #cb5454;
}
</style>
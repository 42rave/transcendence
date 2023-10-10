<script lang='ts'>
export default defineNuxtComponent({
  data: () => ({
    p1_color: '#fff',
    ball_color: '#fff',
    p2_color: '#fff',
    reset: false,
    tab: 0,
  }),
  mounted() {
    // get colors from local storage
    const p1 = localStorage.getItem('p1_color');
    const ball = localStorage.getItem('ball_color');
    const p2 = localStorage.getItem('p2_color');

    if (p1 && this.isColor(p1)) {
      this.p1_color = p1
    }
    if (ball && this.isColor(ball)) {
      this.ball_color = ball
    }
    if (p2 && this.isColor(p2)) {
      this.p2_color = p2
    }
  },
  methods: {
    isColor(strColor: string) {
      const s = new Option().style;
      s.color = strColor;
      return s.color !== '';
    },
    resetColors() {
      this.p1_color = '#fff';
      this.ball_color = '#fff';
      this.p2_color = '#fff';
      localStorage.removeItem('p1_color');
      localStorage.removeItem('ball_color');
      localStorage.removeItem('p2_color');
      this.$event('alert:success', { message: 'Colors reset' });
    },
    updateColors() {
      localStorage.setItem('p1_color', this.p1_color)
      localStorage.setItem('ball_color', this.ball_color)
      localStorage.setItem('p2_color', this.p2_color)
      this.$event('alert:success', { message: 'Colors updated' });
    }
  }
})
</script>

<template>
  <div class="custom-color-widget">
    <div class="preview" v-if='!this.reset'>
      <div id='p1-preview' :style="{'background-color': this.p1_color}" />
      <div id='ball' :style="{'background-color': this.ball_color}" />
      <div id='p2-preview' :style="{'background-color': this.p2_color}" />
    </div>

    <v-tabs v-model="this.tab" background-color="transparent" color="white">
      <v-tab>P1</v-tab>
      <v-tab>Ball</v-tab>
      <v-tab>P2</v-tab>
    </v-tabs>

    <v-window v-model="this.tab">
      <v-window-item>
        <v-color-picker v-model="this.p1_color" mode='rgb'></v-color-picker>
      </v-window-item>
      <v-window-item>
        <v-color-picker v-model="this.ball_color" mode='rgb'></v-color-picker>
      </v-window-item>
      <v-window-item>
        <v-color-picker v-model="this.p2_color" mode='rgb'></v-color-picker>
      </v-window-item>
    </v-window>
    <div class="buttons d-flex flex-row">
      <v-btn class="my-2" color="primary" @click="this.resetColors">Reset</v-btn>
      <v-btn clas="my-2" color="primary" @click="this.updateColors">Update</v-btn>
    </div>
  </div>
</template>

<style scoped>
.buttons {
  align-items: center;
  margin: auto;
  gap: 1rem;
}
.custom-color-widget {
  display: flex;
  flex-direction: column;
  width: fit-content;
  margin: auto;
}
.preview {
  width: 160px;
  height: 90px;
  margin: auto;
  background-color: black;
  position: relative;
}
#p1-preview {
  width: 2.5px;
  height: 15px;
  position: absolute;
  top: 40px;
  left: 5px;
}
#ball {
  width: 3px;
  height: 3px;
  position: absolute;
  top: 45px;
  left: 80px;
}
#p2-preview {
  width: 2.5px;
  height: 15px;
  position: absolute;
  top: 40px;
  right: 5px;
}
</style>
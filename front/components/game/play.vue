<template>
  <canvas id="game-renderer"></canvas>
</template>

<script lang='ts'>
const canvasRatio = 16 / 9;
const widthBackend = 1600;
const heightBackend = 1000;

export default defineNuxtComponent({
  name: 'Game',
  props: ['socket'],
  data: () => ({
    container: null as HTMLElement | null,
    container_observer: null as ResizeObserver | null,
    canvas: null as HTMLCanvasElement | null,
    ctx: null as CanvasRenderingContext2D | null,
    ratio: { x: 1, y: 1 },
  }),
  mounted() {
    this.container = document.getElementById('game-container');
    this.container_observer = new ResizeObserver(() => {
      console.log('resize');
      this.resizeCanvas();
    });
    this.container_observer.observe(this.container);
    this.canvas = document.getElementById('game-renderer') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.drawLoop();
  },
  unmounted() {
    this.container_observer?.disconnect();
  },
  methods: {
    drawLoop() {
      if (!this.ctx) return ;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      requestAnimationFrame(this.drawLoop);
    },
    resizeCanvas() {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;

      let canvasWidth = containerWidth;
      let canvasHeight = containerHeight;

      if (canvasWidth / canvasHeight > canvasRatio) {
        canvasWidth = canvasHeight * canvasRatio;
      } else {
        canvasHeight = canvasWidth / canvasRatio;
      }

      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;

      this.ratio = {
        x: canvasWidth / widthBackend,
        y: canvasHeight / heightBackend,
      };
    }
  }
})
</script>

<style scoped>
#game-renderer {
  background-color: black;
  margin: auto;
}
</style>
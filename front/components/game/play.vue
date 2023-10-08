<template>
  <canvas id="game-renderer"></canvas>
</template>

<script lang='ts'>
class Player {
  constructor (public x: number = 0, public y: number = 0) {}
  speed: number = 0;
}

const backendRes = {x: 16, y: 9};
const backendPlayerRes = {x: 0.25, y: 1.5};
const mapRatio = backendRes.x / backendRes.y;
const speed = 0.1;

export default defineNuxtComponent({
  name: 'Game',
  props: ['socket', 'left'],
  data: () => ({
    container: null as HTMLElement | null,
    container_observer: null as ResizeObserver | null,
    canvas: null as HTMLCanvasElement | null,
    ctx: null as CanvasRenderingContext2D | null,
    ratio: { x: 1, y: 1 },
    playerLeft: new Player(0.5, 4.5),
    playerRight: new Player(15.5, 4.5),
    keyState: {
      ArrowDown: false,
      ArrowUp: false,
    },
    eventListeners: {
      'keydown': null as ((e: KeyboardEvent) => void) | null,
      'keyup': null as ((e: KeyboardEvent) => void) | null,
    },
    frames: {
      fps: 0,
      last: 0,
      delta: 0,
    }
  }),
  mounted() {
    this.container = document.getElementById('game-container');
    this.container_observer = new ResizeObserver(() => {
      console.log('resize');
      this.resizeCanvas();
    });
    this.bindEvents();
    this.container_observer.observe(this.container);
    this.canvas = document.getElementById('game-renderer') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    // console logs fps each second
    setInterval(() => {
      this.frames.fps = Math.round(1000 / this.frames.delta);
    }, 1000);

    this.drawLoop();
  },
  unmounted() {
    this.container_observer?.disconnect();
    this.unbindEvents()
  },
  methods: {
    drawLoop(timestamp: number) {
      if (!this.ctx) return ;
      this.playerLeft.y += this.playerLeft.speed;
      this.playerRight.y += this.playerRight.speed;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.displayPlayer(this.playerLeft);
      this.displayPlayer(this.playerRight);
      this.frames.delta = timestamp - this.frames.last;
      this.frames.last = timestamp;
      this.displayFps();
      requestAnimationFrame(this.drawLoop);
    },
    displayPlayer(player: Player) {
      if (!this.ctx) return ;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(
        player.x * this.ratio.x - backendPlayerRes.x * this.ratio.x / 2,
        player.y * this.ratio.y - backendPlayerRes.y * this.ratio.y / 2,
        backendPlayerRes.x * this.ratio.x,
        backendPlayerRes.y * this.ratio.y,
      );
    },
    displayFps() {
      if (!this.ctx) return ;
      this.ctx.fillStyle = 'grey';
      this.ctx.font = '0.75rem Arial';
      this.ctx.fillText(`fps: ${this.frames.fps} (${this.frames.delta.toFixed(2)}ms)`, 10, 20);
    },
    resizeCanvas() {
      const containerWidth = this.container.clientWidth;
      const containerHeight = this.container.clientHeight;

      let canvasWidth = containerWidth;
      let canvasHeight = containerHeight;

      if (canvasWidth / canvasHeight > mapRatio) {
        canvasWidth = canvasHeight * mapRatio;
      } else {
        canvasHeight = canvasWidth / mapRatio;
      }

      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;

      this.ratio = {
        x: canvasWidth / backendRes.x,
        y: canvasHeight / backendRes.y,
      };
    },
    bindEvents() {
      this.eventListeners.keydown = (e) => {
        if (e.key === 'ArrowDown' && !this.keyState.ArrowDown) {
          this.keyState.ArrowDown = true;
          if (this.left)
            this.playerLeft.speed += speed;
          else
            this.playerRight.speed += speed;
          console.log(`keydown: ${e.key}`);
        }
        if (e.key === 'ArrowUp' && !this.keyState.ArrowUp) {
          this.keyState.ArrowUp = true;
          if (this.left)
            this.playerLeft.speed -= speed;
          else
            this.playerRight.speed -= speed;
          console.log(`keydown: ${e.key}`);
        }
      };
      document.addEventListener('keydown', this.eventListeners.keydown);
      this.eventListeners.keyup = (e) => {
        if (e.key === 'ArrowDown' && this.keyState.ArrowDown) {
          this.keyState.ArrowDown = false;
          if (this.left)
            this.playerLeft.speed -= speed;
          else
            this.playerRight.speed -= speed;
          console.log(`keydown: ${e.key}`);
        }
        if (e.key === 'ArrowUp' && this.keyState.ArrowUp) {
          this.keyState.ArrowUp = false;
          if (this.left)
            this.playerLeft.speed += speed;
          else
            this.playerRight.speed += speed;
          console.log(`keydown: ${e.key}`);
        }
      }
      document.addEventListener('keyup', this.eventListeners.keyup);
    },
    unbindEvents() {
      document.removeEventListener('keydown', this.eventListeners.keydown);
      document.removeEventListener('keyup', this.eventListeners.keyup);
    },
  }
})
</script>

<style scoped>
#game-renderer {
  background-color: black;
  margin: auto;
}
</style>
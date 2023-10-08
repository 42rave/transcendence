<template>
  <canvas id="game-renderer"></canvas>
</template>

<script lang='ts'>
import { Vector2, Player, Ball } from '~/types/game';

const backendRes = new Vector2(16, 9);
const backendPlayerRes = new Vector2(0.25, 1.5);
const backendBallRes = new Vector2(0.25, 0.25);
const mapRatio = backendRes.x / backendRes.y;
const speed = 0.005;
const maxFps = 30;

export default defineNuxtComponent({
  name: 'Game',
  props: ['socket', 'left'],
  data: () => ({
    container: null as HTMLElement | null,
    container_observer: null as ResizeObserver | null,
    canvas: null as HTMLCanvasElement | null,
    ctx: null as CanvasRenderingContext2D | null,
    ratio: new Vector2(1),
    playerLeft: new Player({
      position: new Vector2(0.5, backendRes.y / 2),
      size: backendPlayerRes.clone(),
      color: 'white'
    }),
    playerRight: new Player({
      position: new Vector2(backendRes.x - 0.5, backendRes.y / 2),
      size: backendPlayerRes.clone(),
      color: 'white'
    }),
    ball: new Ball({
      position: backendRes.div(2),
      size: backendBallRes.clone(),
      color: 'white'
    }),
    inputs: {
      ArrowDown: false,
      ArrowUp: false,
      speed: 0,
    },
    eventListeners: {
      keydown: null as EventListenerOrEventListenerObject | null,
      keyup: null as EventListenerOrEventListenerObject | null,
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
    this.container_observer.observe(this.container!);
    this.canvas = document.getElementById('game-renderer') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    // console logs fps each second
    setInterval(() => {
      this.frames.fps = Math.round(1000 / this.frames.delta);
    }, 1000);

    this.drawLoop(0);
  },
  unmounted() {
    this.container_observer?.disconnect();
    this.unbindEvents()
  },
  methods: {
    async drawLoop(timestamp: number) {
      if (!this.ctx) return ;

      if (this.frames.last == 0) this.frames.last = timestamp;
      this.frames.delta = timestamp - this.frames.last;
      this.frames.last = timestamp;

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);

      this.playerLeft.display(this.ctx, this.ratio);
      this.playerRight.display(this.ctx, this.ratio);
      this.ball.display(this.ctx, this.ratio);

      (this.left ? this.playerLeft : this.playerRight).update(this.frames.delta, backendRes);
      (this.left ? this.playerLeft : this.playerRight).setSpeed(Vector2.down().mul(this.inputs.speed));

      this.displayFps();
      setTimeout(() => {
        window.requestAnimationFrame(this.drawLoop);
      }, 1000 / maxFps);
      return ;
    },
    displayFps() {
      if (!this.ctx) return ;
      this.ctx.fillStyle = 'grey';
      this.ctx.font = '0.75rem Arial';
      this.ctx.fillText(`fps: ${this.frames.fps} (${this.frames.delta.toFixed(2)}ms)`, 10, 20);
    },
    resizeCanvas() {
      let canvasWidth = this.container!.clientWidth;
      let canvasHeight = this.container!.clientHeight;

      if (canvasWidth / canvasHeight > mapRatio) {
        canvasWidth = canvasHeight * mapRatio;
      } else {
        canvasHeight = canvasWidth / mapRatio;
      }

      this.canvas!.width = canvasWidth;
      this.canvas!.height = canvasHeight;

      this.ratio = new Vector2(canvasWidth / backendRes.x, canvasHeight / backendRes.y);
    },
    bindEvents() {
      this.eventListeners.keydown = ((e: KeyboardEvent) => {
        let _speed = 0;

        if (e.key == 'ArrowDown') {
          if (!this.inputs.ArrowDown) {
            this.inputs.ArrowDown = true;
            _speed += speed;
            // TODO: emit to backend
          }
        }
        if (e.key == 'ArrowUp') {
          if (!this.inputs.ArrowUp) {
            this.inputs.ArrowUp = true;
            _speed -= speed;
            // TODO: emit to backend
          }
        }
        this.inputs.speed += _speed;
      }) as EventListenerOrEventListenerObject;
      document.addEventListener('keydown', this.eventListeners.keydown);

      this.eventListeners.keyup = ((e: KeyboardEvent) => {
        let _speed = 0;

        if (e.key == 'ArrowDown') {
          if (this.inputs.ArrowDown) {
            this.inputs.ArrowDown = false;
            _speed -= speed;
            // TODO: emit to backend
          }
        }
        if (e.key == 'ArrowUp') {
          if (this.inputs.ArrowUp) {
            this.inputs.ArrowUp = false;
            _speed += speed;
            // TODO: emit to backend
          }
        }
        this.inputs.speed += _speed;
      }) as EventListenerOrEventListenerObject;
      document.addEventListener('keyup', this.eventListeners.keyup!);
    },
    unbindEvents() {
      document.removeEventListener('keydown', this.eventListeners.keydown!);
      document.removeEventListener('keyup' , this.eventListeners.keyup!);
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
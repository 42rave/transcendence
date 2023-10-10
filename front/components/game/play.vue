<template>
  <canvas id="game-renderer"></canvas>
</template>

<script lang='ts'>
import { Vector2, Player, Ball } from '~/types/game';
import { User } from '~/types/user';

const backendRes = new Vector2(16, 9);
const backendPlayerRes = new Vector2(0.25, 1.5);
const backendBallRes = new Vector2(0.25, 0.25);
const mapRatio = backendRes.x / backendRes.y;
const speed = 0.005;

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
    }, 0),
    playerRight: new Player({
      position: new Vector2(backendRes.x - 0.5, backendRes.y / 2),
      size: backendPlayerRes.clone(),
      color: 'white'
    }, 0),
    ball: new Ball({
      position: backendRes.clone().div(2),
      size: backendBallRes.clone(),
      speed: Vector2.zero(),
      color: 'white',
    }),
    inputs: {
      ArrowDown: false,
      ArrowUp: false,
      speed: 0,
      oldSpeed: 0,
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

    // get Players colors from local storage
    const color_p1 = localStorage.getItem('p1_color');
    const color_p2 = localStorage.getItem('p2_color');
    const color_ball = localStorage.getItem('ball_color');

    if (color_p1 && this.isColor(color_p1)) {
      this.playerLeft.color = color_p1;
    }
    if (color_p2 && this.isColor(color_p2)) {
      this.playerRight.color = color_p2;
    }
    if (color_ball && this.isColor(color_ball)) {
      this.ball.color = color_ball;
    }

    // console logs fps each second
    setInterval(() => {
      this.frames.fps = Math.round(1000 / this.frames.delta);
    }, 1000);

    this.socket.on("game:move", ({move, side}: {user: User, move: number, side: 'left' | 'right'}) => {
      let player = side === 'left' ? this.playerLeft : this.playerRight;
      if (move == 1) player.setSpeed(Vector2.up().mul(speed));
      else if (move == 2) player.setSpeed(Vector2.down().mul(speed));
      else player.setSpeed(Vector2.zero());
    })
    this.socket.on("game:score", (data: {p1_score: number, p2_score: number}) => {
      console.log(data);
      this.playerLeft.score = data.p1_score;
      this.playerRight.score = data.p2_score;
    })

    this.ball.setPosition(new Vector2(backendRes.x / 2, backendRes.y / 2));
    this.socket.on("game:ball", (data: {position: Vector2, speed: Vector2}) => {
      this.ball.setPosition(new Vector2(data.position.x, data.position.y));
      this.ball.setSpeed(new Vector2(data.speed.x * speed, data.speed.y * speed));
    });

    this.drawLoop(0);
  },
  unmounted() {
    this.container_observer?.disconnect();
    this.socket.off("game:move");
    this.socket.off("game:ball");
    this.socket.off("game:score");
    this.socket.off("game:");
    this.unbindEvents()
  },
  methods: {
    isColor(strColor: string) {
      const s = new Option().style;
      s.color = strColor;
      return s.color !== '';
    },
    async drawLoop(timestamp: number) {
      if (!this.ctx) return ;

      if (this.frames.last == 0) this.frames.last = timestamp;
      this.frames.delta = timestamp - this.frames.last;
      this.frames.last = timestamp;

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);

      this.playerLeft.display(this.ctx, this.ratio);
      this.playerRight.display(this.ctx, this.ratio);
      this.ctx.fill();

      this.ball.display(this.ctx, this.ratio);

      this.manageSocketEvents();

      this.playerLeft.update(this.frames.delta, backendRes);
      this.playerRight.update(this.frames.delta, backendRes);
      this.ball.update(this.frames.delta, backendRes);
      (this.left ? this.playerLeft : this.playerRight).setSpeed(Vector2.down().mul(this.inputs.speed));
      this.inputs.oldSpeed = this.inputs.speed;

      this.displayFps();
      this.displayScores();
      window.requestAnimationFrame(this.drawLoop);
      return ;
    },
    manageSocketEvents() {
      if (this.inputs.speed != this.inputs.oldSpeed) {
        let move = 0;
        if (this.inputs.speed < 0) move = 1;
        else if (this.inputs.speed > 0) move = 2;

        this.socket.emit('game:move', move);
      }
    },
    displayFps() {
      if (!this.ctx) return ;
      this.ctx.fillStyle = 'grey';
      this.ctx.font = '0.75rem Arial';
      this.ctx.fillText(`fps: ${this.frames.fps} (${this.frames.delta.toFixed(2)}ms)`, 10, 20);
    },
    displayScores() {
      if (!this.ctx) return;
      this.ctx.fillStyle = 'grey';
      this.ctx.font = '0.75rem Arial';
      this.ctx.fillText(`${this.playerLeft.score} - ${this.playerRight.score}`, this.canvas!.width / 2 - 20, 20);
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
          }
        }
        if (e.key == 'ArrowUp') {
          if (!this.inputs.ArrowUp) {
            this.inputs.ArrowUp = true;
            _speed -= speed;
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
          }
        }
        if (e.key == 'ArrowUp') {
          if (this.inputs.ArrowUp) {
            this.inputs.ArrowUp = false;
            _speed += speed;
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
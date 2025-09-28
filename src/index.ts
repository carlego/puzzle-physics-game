import { Vec2, World, Circle, Edge } from 'planck-js';

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d')!;
const world = new World(new Vec2(0, 10));

// Ground
world.createBody().createFixture( new Edge ( new Vec2(0, 500), new Vec2(800, 500)), {
  friction: 0.3
});

// Ball
const ball = world.createDynamicBody(new Vec2(100, 100));
ball.createFixture( new Circle(20), {
  density: 1,
  friction: 0.3,
  restitution: 0.6
});

function step() {
  world.step(1 / 60);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pos = ball.getPosition();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();

  requestAnimationFrame(step);
}

step();

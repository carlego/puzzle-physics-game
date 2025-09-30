import {
  World,
  Vec2,
  Body,
  Fixture,
  Circle,
  Box,
  Edge,
  Polygon
} from "planck-js";

export interface SimulationOptions {
  width?: number;
  height?: number;
  scale?: number;
}

export class SimulationFrame {
  private container: HTMLElement;
  private options: SimulationOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private world!: World;
  private width: number;
  private height: number;
  private scale: number;

  constructor(container: HTMLElement, options: SimulationOptions = {}) {
    this.container = container;
    this.options = options;

    this.scale = options.scale || 30;
    this.width = options.width || 600;
    this.height = options.height || 400;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.className = "simulation-frame";

    this.container.appendChild(this.canvas);

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    this.ctx = context;

    this.initWorld();
    this.bindDrop();
    this.run();
  }

  private initWorld() {
    this.world = new World({ gravity: new Vec2(0, -10) });

    // Add ground
    const ground = this.world.createBody();
    ground.createFixture(new Edge(new Vec2(-20, 0), new Vec2(20, 0)), 0);
  }

  private bindDrop() {
    this.canvas.addEventListener("dragover", e => e.preventDefault());
    this.canvas.addEventListener("drop", e => {
      e.preventDefault();

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.scale;
      const y = (this.height - (e.clientY - rect.top)) / this.scale;

      const shape = e.dataTransfer?.getData("shape");
      if (shape) this.spawnShape(shape, x, y);
    });
  }

  public spawnShape(shape: string, x: number, y: number) {
    const body = this.world.createDynamicBody(new Vec2(x, y));

    if (shape === "circle") {
      body.createFixture(new Circle(0.5), { density: 1, friction: 0.3 });
    } else if (shape === "square") {
      body.createFixture(new Box(0.5, 0.5), { density: 1, friction: 0.3 });
      body.setUserData({ type: "square" });
    } else if (shape === "triangle") {
      body.createFixture(new Polygon([
        new Vec2(0, 0.6), new Vec2(-0.6, -0.6), Vec2(0.6, -0.6)
      ]), { density: 1, friction: 0.3 });
      body.setUserData({ type: "triangle" });
    }
  }

  public reset() {
    this.initWorld();
  }

  private run() {
    const step = () => {
    const dt = 1 / 60;

    // Apply non-Newtonian behavior for triangle
    for (let b = this.world.getBodyList(); b; b = b.getNext()) {
      const data = b.getUserData() as { type?: string } | undefined;
      if (data?.type === "triangle") {
        const vel = b.getLinearVelocity();
        if (vel.y < 0) {
          const k = 2.0; // tweak coefficient: higher = stronger slowdown
          let upwardForce = -k * vel.y * vel.y;
          upwardForce = Math.min(upwardForce, 100);
          b.applyForce(new Vec2(0, upwardForce), b.getWorldCenter());
        }
      }

      if (data?.type === "square") {
        const pos = b.getPosition();
        const vel = b.getLinearVelocity();

        // where the triangle should hover
        const targetY = 5;   // adjust as needed
        const k = 20.0;      // spring stiffness
        const d = 5.0;       // damping factor

        // spring force toward target
        const springForce = k * (targetY - pos.y);

        // damping force against velocity
        const dampingForce = -d * vel.y;

        // total vertical force
        const totalForce = springForce + dampingForce;

        b.applyForce(new Vec2(0, totalForce), b.getWorldCenter());
      }
    }

      this.world.step(dt);
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let b = this.world.getBodyList(); b; b = b.getNext()) {
        for (let f = b.getFixtureList(); f; f = f.getNext()) {
          this.renderShape(b, f);
        }
      }

      requestAnimationFrame(step);
    };
    step();
  }

  private renderShape(body: Body, fixture: Fixture) {
    const shape: any = fixture.getShape();
    const pos = body.getPosition();
    const angle = body.getAngle();

    this.ctx.save();
    this.ctx.translate(pos.x * this.scale, this.height - pos.y * this.scale);
    this.ctx.rotate(-angle);

    if (shape.getType() === "circle") {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, shape.m_radius * this.scale, 0, 2 * Math.PI);
      this.ctx.fillStyle = "blue";
      this.ctx.fill();
    } else if (shape.getType() === "polygon") {
      this.ctx.beginPath();
      const vertices = shape.m_vertices;
      this.ctx.moveTo(vertices[0].x * this.scale, -vertices[0].y * this.scale);
      for (let i = 1; i < vertices.length; i++) {
        this.ctx.lineTo(vertices[i].x * this.scale, -vertices[i].y * this.scale);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = "red";
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}

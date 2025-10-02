import planck, { World, Vec2, Polygon, Edge } from "planck-js";
import { Toolbox } from "./Toolbox";

export class SimulationFrame {
  private world: World;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private toolbox: Toolbox;

  constructor(container: HTMLElement, toolboxItems: any[]) {
    this.canvas = document.createElement("canvas");
    this.width = container.clientWidth || 600;
    this.height = container.clientHeight || 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d")!;
    this.world = new planck.World({ gravity: new planck.Vec2(0, -10) });
    
    // Add ground
    const ground = this.world.createBody();
    ground.createFixture(new Edge(new Vec2(-20, 0), new Vec2(20, 0)), 0);

    // Toolbox manages its own rendering + drag/drop
    this.toolbox = new Toolbox(this.world, container, this.canvas, toolboxItems);

    this.run();
  }

  public loadScene(scene: any) {
    scene.puzzle.forEach((obj: any) => this.createStaticBody(obj));
  }

  private createStaticBody(obj: any) {
    const body = this.world.createBody({
      type: obj.body.type,
      position: obj.body.position
        ? new planck.Vec2(obj.body.position[0], obj.body.position[1])
        : new planck.Vec2(0, 0),
    });

    obj.fixtures.forEach((fix: any) => {
      let shape: any;
      if (fix.shape.type === "polygon") {
        shape = new planck.Polygon(
          fix.shape.vertices.map((v: [number, number]) => new planck.Vec2(...v))
        );
      } else if (fix.shape.type === "edge") {
        const vertex1: [number, number] = fix.shape.vertex1;
        let vertex2: [number, number] = fix.shape.vertex2
        shape = new planck.Edge(
          new planck.Vec2(vertex1[0], vertex1[1]),
          new planck.Vec2(vertex2[0], vertex2[1]),
        );
      }
      body.createFixture(shape, {
        density: fix.density ?? 0,
        friction: fix.friction ?? 0.3,
      });
    });
  }

  private run() {
    const step = () => {
      this.world.step(1 / 60);
      this.toolbox.update();
      this.render();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let b = this.world.getBodyList(); b; b = b.getNext()) {
      const pos = b.getPosition();
      const angle = b.getAngle();

      for (let f = b.getFixtureList(); f; f = f.getNext()) {
        const shape: any = f.getShape();

        this.ctx.save();
        this.ctx.translate(pos.x * 30, this.height - pos.y * 30);
        this.ctx.rotate(-angle);

        if (shape.m_type === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, shape.m_radius * 30, 0, 2 * Math.PI);
          this.ctx.stroke();
        } else if (shape.m_type === "polygon") {
          const verts = shape.m_vertices;
          this.ctx.beginPath();
          this.ctx.moveTo(verts[0].x * 30, -verts[0].y * 30);
          verts.slice(1).forEach((v: any) =>
            this.ctx.lineTo(v.x * 30, -v.y * 30)
          );
          this.ctx.closePath();
          this.ctx.stroke();
        } else if (shape.m_type === "edge") {
          const v1 = shape.m_vertex1;
          const v2 = shape.m_vertex2;
          this.ctx.beginPath();
          this.ctx.moveTo(v1.x * 30, -v1.y * 30);
          this.ctx.lineTo(v2.x * 30, -v2.y * 30);
          this.ctx.stroke();
        }

        this.ctx.restore();
      }
    }
  }
}

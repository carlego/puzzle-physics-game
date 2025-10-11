import planck, { World, Vec2, Polygon, Edge } from "planck-js";
import { Toolbox } from "./Toolbox";
import { WorldViewport } from "./WorldViewPort";


export class SimulationFrame {
  private world: World;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private toolbox: Toolbox;
  private viewport: WorldViewport;
  private SCALE = 30; // pixels per world unit

  constructor(container: HTMLElement, toolboxItems: any[]) {
    this.canvas = document.createElement("canvas");
    this.width = container.clientWidth || 600;
    this.height = container.clientHeight || 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    container.appendChild(this.canvas);

    this.canvasContext = this.canvas.getContext("2d")!;
    this.viewport = new WorldViewport(this.canvas, this.SCALE); 
    this.world = new World({ gravity: new Vec2(0, -10) });
    
    // Add ground
    this.createWorldBounds();

    // Toolbox manages its own rendering + drag/drop
    this.toolbox = new Toolbox(this.world, container, this.canvas, toolboxItems);
    this.attachResetButton(); 
    this.run();
  }

  public loadScene(scene: any) {
    scene.puzzle.forEach((obj: any) => this.createStaticBody(obj));
  }

  private createStaticBody(obj: any) {
    const body = this.world.createBody({
      type: obj.body.type,
      position: obj.body.position
        ? new Vec2(obj.body.position[0], obj.body.position[1])
        : new Vec2(0, 0),
    });

    obj.fixtures.forEach((fix: any) => {
      let shape: any;
      if (fix.shape.type === "polygon") {
        shape = new Polygon(
          fix.shape.vertices.map((v: [number, number]) => new Vec2(...v))
        );
      } else if (fix.shape.type === "edge") {
        const vertex1: [number, number] = fix.shape.vertex1;
        let vertex2: [number, number] = fix.shape.vertex2
        shape = new Edge(
          new Vec2(vertex1[0], vertex1[1]),
          new Vec2(vertex2[0], vertex2[1]),
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
  const ctx = this.canvasContext;
  ctx.clearRect(0, 0, this.width, this.height);

  for (let body = this.world.getBodyList(); body; body = body.getNext()) {
    const pos = body.getPosition();
    const angle = body.getAngle();

    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const shape: any = fixture.getShape();
      ctx.save();

      // translate to world position in canvas space
      const posCanvas = this.viewport.worldToCanvas(pos);
      ctx.translate(posCanvas.x, posCanvas.y);
      ctx.rotate(-angle);

      if (shape.m_type === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, this.viewport.lengthToCanvas(shape.m_radius), 0, 2 * Math.PI);
        ctx.stroke();

      } else if (shape.m_type === "polygon") {
        const verts = shape.m_vertices.map((v: any) =>
          this.viewport.lengthToCanvasVec(v)
        );

        ctx.beginPath();
        ctx.moveTo(verts[0].x, -verts[0].y);
        for (let i = 1; i < verts.length; i++) {
          ctx.lineTo(verts[i].x, -verts[i].y);
        }
        ctx.closePath();
        ctx.stroke();

      } else if (shape.m_type === "edge") {
        const v1 = this.viewport.lengthToCanvasVec(shape.m_vertex1);
        const v2 = this.viewport.lengthToCanvasVec(shape.m_vertex2);

        ctx.beginPath();
        ctx.moveTo(v1.x, -v1.y);
        ctx.lineTo(v2.x, -v2.y);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

  private createWorldBounds() {
    const worldWidth = this.viewport.lengthToWorld(this.canvas.width);
    const worldHeight = this.viewport.lengthToWorld(this.canvas.height);

    const ground = this.world.createBody();

    /// Create a box around the edges
    // Bottom Edge
    ground.createFixture(
      new Edge(new Vec2(0, 0), new Vec2(worldWidth, 0))
    );
    // Top Edge
    ground.createFixture(
      new Edge(new Vec2(-worldWidth, worldHeight), new Vec2(worldWidth, worldHeight))
    );

    // Left Edge
    ground.createFixture(
      new Edge(new Vec2(0, 0), new Vec2(0, worldHeight))
    );
    // Right Edge
    ground.createFixture(
      new Edge(new Vec2(worldWidth, -worldHeight), new Vec2(worldWidth, worldHeight))
    );
  }

private attachResetButton() {
  const resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    // Destroy all existing bodies
    let body = this.world.getBodyList();
    while (body) {
      const next = body.getNext();
      this.world.destroyBody(body);
      body = next;
    }

    // Recreate static boundaries (walls)
    this.createWorldBounds();


    console.log("✅ Simulation reset");
  });
}


}

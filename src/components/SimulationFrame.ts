import { World, Vec2, Polygon, Edge, } from "planck-js";
import { Toolbox } from "./Toolbox";
import { WorldViewport } from "./WorldViewPort";
import { Game } from "./Game";

type SimulationFrameOptions = {
  container: HTMLElement;
  toolboxItems: any[];
  puzzleName: string;
  puzzleData: any;
};

export class SimulationFrame {
  private world: World;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private toolbox: Toolbox;
  private viewport: WorldViewport;
  private game: Game;
  private SCALE = 30; // pixels per world unit
  private puzzleData : any = null;
  private isCleared = false;
  private isPaused = false;
  private resetCount = 0;
  private animationFrameId: number | null = null; // track active loop
  private puzzleName: string;
  private container: HTMLElement;


  constructor({container, toolboxItems, puzzleName, puzzleData} : SimulationFrameOptions) {
    this.canvas = document.createElement("canvas");
    this.width = container.clientWidth || 600;
    this.height = container.clientHeight || 500;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.puzzleData = puzzleData;
    this.puzzleName = puzzleName;
    this.container = container;

    container.appendChild(this.canvas);

    this.canvasContext = this.canvas.getContext("2d")!;
    this.viewport = new WorldViewport(this.canvas, this.SCALE); 
    this.world = new World({ gravity: new Vec2(0, -10) });
    
    this.createWorldBounds();
    this.setupContactListener();
    this.loadScene();

    this.game = new Game(this.puzzleName);
    // Toolbox manages its own rendering + drag/drop
    this.toolbox = new Toolbox(this.world, container, this.canvas, toolboxItems, this.game);
    this.attachResetButton(); 
    this.run();
  }

  public loadScene() {
    this.puzzleData.puzzle.forEach((obj: any) => this.createStaticBody(obj));
  }

  private setupContactListener() {
  this.world.on("begin-contact", (contact) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();

    const bodyA = fixtureA.getBody();
    const bodyB = fixtureB.getBody();

    const aIsGoal = (bodyA.getUserData() as any)?.isGoal;
    const bIsGoal = (bodyB.getUserData() as any)?.isGoal;

    if (aIsGoal || bIsGoal) {
      this.onGoalHit();
    }
  });
}

  private onGoalHit() {
    if (this.isCleared) return;
    this.isCleared = true;

    // Stop physics updates
    this.stopSimulation();
    const overlay = document.createElement("div");
    overlay.className = "cleared-overlay";

    const lastDrop = this.toolbox.getLastDropPosition();
    this.game.endCurrentAttempt(true);

    overlay.innerHTML = `
      <h2>Cleared!</h2>
      <p>${this.game.exportToHTMLTable()}</p>
      <p>Total Attempts: ${this.game.getAttemptsCount()}</p>
    `;

    this.container.appendChild(overlay);
    console.log("Goal reached!");
  }

  private createStaticBody(obj: any) {
    const body = this.world.createBody({
      type: obj.body.type,
      position: obj.body.position
        ? new Vec2(obj.body.position[0], obj.body.position[1])
        : new Vec2(0, 0),
      userData: obj.body.userData || {},
    });

    obj.fixtures?.forEach((fix: any) => {
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
        isSensor: fix.isSensor ?? false,
      });
    });
  }

  private run() {
    const step = () => {
      if (this.isPaused) return;
      this.world.step(1 / 60);
      this.toolbox.update();
      this.render();
      this.animationFrameId = requestAnimationFrame(step);
    };
    this.animationFrameId = requestAnimationFrame(step);
  }

  private stopSimulation() {
    this.canvas.style.pointerEvents = "none";
    this.isPaused = true;

    // Stop animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private attachResetButton() {
    const resetBtn = document.getElementById("reset-btn");
    if (!resetBtn) return;

    resetBtn.addEventListener("click", () => {
      document.querySelector(".cleared-overlay")?.remove();
      this.resetCount++;
      // Stop current loop before recreating world
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Recreate world
      this.world = new World(new Vec2(0, -10));

      this.isCleared = false;
      this.isPaused = false;
      this.canvas.style.pointerEvents = "auto";

      this.createWorldBounds();
      this.setupContactListener();

      this.toolbox.setWorld(this.world);

      // Clear and restart loop
      this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.loadScene();
      this.run();

      // Reset game attempts
      this.game.endCurrentAttempt(false);

      console.log("Simulation reset");
    });
  }

  private render() {
    const ctx = this.canvasContext;
    ctx.clearRect(0, 0, this.width, this.height); 
    // Pass 1: Draw restricted zones first (background)
    this.drawBodies((body) => (body.getUserData() as any)?.isRestrictedZone);

  // Pass 2: Draw everything else (foreground)
    this.drawBodies((body) => !(body.getUserData() as any)?.isRestrictedZone);
    
  }

  private drawBodies(filterFn: (b: any) => boolean) {
    const ctx = this.canvasContext;

    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      if (!filterFn(body)) continue;
      const pos = body.getPosition();
      const angle = body.getAngle();
      const userData = body.getUserData() as any;
      const isGoal = userData?.isGoal;
      const isRestrictedZone = userData?.isRestrictedZone;

      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        const shape: any = fixture.getShape();

        ctx.save();

        const posCanvas = this.viewport.worldToCanvas(pos);
        ctx.translate(posCanvas.x, posCanvas.y);
        ctx.rotate(-angle);

        if (shape.m_type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, this.viewport.lengthToCanvas(shape.m_radius), 0, 2 * Math.PI);
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

        } else if (shape.m_type === "edge") {
          const v1 = this.viewport.lengthToCanvasVec(shape.m_vertex1);
          const v2 = this.viewport.lengthToCanvasVec(shape.m_vertex2);

          ctx.beginPath();
          ctx.moveTo(v1.x, -v1.y);
          ctx.lineTo(v2.x, -v2.y);
          ctx.stroke();
        }

        if (isGoal) {
          ctx.fillStyle = "lightgreen";
          ctx.fill();
        } else if (isRestrictedZone) {
          ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
          ctx.fill();
        } else {
          ctx.fillStyle = "white";
          ctx.fill();
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
}

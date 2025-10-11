import planck, { World, Vec2, Body, Shape } from "planck-js";
import { drawFixture } from "./utils/drawFixture";

interface ToolboxItemDef {
  name: string;
  fixtures: any[];
}

export class Toolbox {
  private world: World;
  private container: HTMLElement;
  private toolboxDiv: HTMLElement;
  private items: ToolboxItemDef[];
  private canvas: HTMLCanvasElement;
  private currentDragItem: ToolboxItemDef | null = null;

  constructor(
    world: World,
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    items: ToolboxItemDef[]
  ) {
    this.world = world;
    this.container = container;
    this.items = items;
    this.canvas = canvas;

    this.toolboxDiv = document.createElement("div");
    this.toolboxDiv.className = "toolbox";
    this.container.parentElement?.appendChild(this.toolboxDiv);

    this.render();
    this.attachCanvasDropEvents();
  }

  private render() {
    this.toolboxDiv.innerHTML = ""; // clear toolbox

    this.items.forEach((item) => {
  const wrapper = document.createElement("div");
  wrapper.className = "toolbox-item";
  wrapper.draggable = true;

  // Use fixed-size preview
  const thumbCanvas = this.makePreviewCanvas(item);
  wrapper.appendChild(thumbCanvas);

  wrapper.addEventListener("dragstart", (e: DragEvent) => {
    this.currentDragItem = item;
    if (e.dataTransfer) {
      // Drag image is the thumbnail itself
      // TODO: Firefox actually shrinks the image a bit here. Need to figure out how to set fixed size.
      e.dataTransfer.setDragImage(
        thumbCanvas,
        thumbCanvas.width / 2,
        thumbCanvas.height / 2
      );
    }
  });

  this.toolboxDiv.appendChild(wrapper);
});

  }

  private attachCanvasDropEvents() {
    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!this.currentDragItem) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / 30;
      const y = (rect.bottom - e.clientY) / 30;

      this.spawnItem(this.currentDragItem, x, y);
      this.currentDragItem = null;
    });
  }

  private makePreviewCanvas(item: ToolboxItemDef): HTMLCanvasElement {
    const SIM_SCALE = 30; // must match SimulationFrame scale
    const size = 80; // fixed thumbnail box in pixels
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);

    // Center world origin in thumbnail
    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Draw each fixture using same sim scale
    const world = new planck.World();
    const body = world.createBody();

    item.fixtures.forEach((fix: any) => {
      let shape;
      switch (fix.shape.type) {
        case "circle":
          shape = new planck.Circle(fix.shape.radius);
          break;
        case "polygon":
          shape = new planck.Polygon(
            fix.shape.vertices.map(
              (v: [number, number]) => new planck.Vec2(v[0], v[1])
            )
          );
          break;
        case "edge":
          shape = new planck.Edge(
            new planck.Vec2(fix.shape.vertex1),
            new planck.Vec2(fix.shape.vertex2)
          );
          break;
        case "chain":
          shape = new planck.Chain(
            fix.shape.vertices.map(
              (v: [number, number]) => new planck.Vec2(v[0], v[1])
            ),
            fix.shape.loop ?? false
          );
          break;
      }
      const fixture = body.createFixture(shape as Shape, fix);
      drawFixture(ctx, fixture, SIM_SCALE);
    });

    ctx.restore();
    return canvas;
  }


  private spawnItem(item: ToolboxItemDef, x: number, y: number): Body {
    const body = this.world.createBody({
      type: "dynamic",
      position: new planck.Vec2(x, y),
    });

    item.fixtures.forEach((fix: any) => {
      let shape;
      switch (fix.shape.type) {
        case "circle":
          shape = new planck.Circle(fix.shape.radius);
          break;
        case "polygon":
          shape = new planck.Polygon(
            fix.shape.vertices.map(
              (v: [number, number]) => new planck.Vec2(v[0], v[1])
            )
          );
          break;
        default:
          throw new Error(`Unsupported tool shape: ${fix.shape.type}`);
      }

      body.createFixture(shape, {
        density: fix.density ?? 1,
        friction: fix.friction ?? 0.3,
        restitution: fix.restitution ?? 0.2,
      });
    });

    if (item.name === "HoverTriangle") {
      body.setUserData({ type: "hover-triangle" });
    }

    return body;
  }

  public setWorld(world: World) {
    this.world = world;
}

  public update() {
    for (let b = this.world.getBodyList(); b; b = b.getNext()) {
      const data = b.getUserData() as any;
      if (data?.type === "hover-triangle") {
        const vel = b.getLinearVelocity();
        const correctiveForce = vel.clone().neg();
        correctiveForce.mul(0.5 * vel.length());
        b.applyForceToCenter(correctiveForce);
      }
    }
  }
}

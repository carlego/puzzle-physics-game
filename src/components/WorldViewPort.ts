import { Vec2 } from "planck-js";

export class WorldViewport {
  private readonly scale: number; // pixels per world unit
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
  }

  /** Convert world coords (meters) → canvas coords (pixels) */
  worldToCanvas(vec: Vec2): { x: number; y: number } {
    return {
      x: vec.x * this.scale,
      // flip Y because canvas grows downward
      y: this.canvas.height - vec.y * this.scale,
    };
  }

  /** Convert canvas coords (pixels) → world coords (meters) */
  canvasToWorld(x: number, y: number): Vec2 {
    return new Vec2(
      x / this.scale,
      (this.canvas.height - y) / this.scale
    );
  }

  /** Convert a length in world units (meters) → pixels */
  lengthToCanvas(lenWorld: number): number {
    return lenWorld * this.scale;
  }

  /** Convert a length in pixels → world units (meters) */
  lengthToWorld(lenCanvas: number): number {
    return lenCanvas / this.scale;
  }

  lengthToCanvasVec(vec: Vec2): { x: number; y: number } {
  return { x: vec.x * this.scale, y: vec.y * this.scale };
}

}

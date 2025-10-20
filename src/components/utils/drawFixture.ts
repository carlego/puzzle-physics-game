// renderUtils.ts
import { Fixture, CircleShape, PolygonShape, EdgeShape, ChainShape } from "planck-js";

/**
 * Draw a single fixture onto a canvas context.
 * @param ctx CanvasRenderingContext2D
 * @param fixture Planck fixture
 * @param scale pixels per world unit (e.g. 30)
 */
export function drawFixture(
  ctx: CanvasRenderingContext2D,
  fixture: Fixture,
  scale: number
) {
  let shape = fixture.getShape();
  ctx.beginPath();

  switch (shape.getType()) {
    case "circle": {
      const pos = (shape as CircleShape).m_p;
      ctx.arc(
        pos.x * scale,
        -pos.y * scale,
        shape.m_radius * scale,
        0,
        Math.PI * 2
      );
      break;
    }
    case "polygon": {
      const verts = (shape as PolygonShape).m_vertices;
      ctx.moveTo(verts[0]!.x * scale, -verts[0]!.y * scale);
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i]!.x * scale, -verts[i]!.y * scale);
      }
      ctx.closePath();
      break;
    }
    case "edge": {
      const v1 = (shape as EdgeShape).m_vertex1;
      const v2 = (shape as EdgeShape).m_vertex2;
      ctx.moveTo(v1.x * scale, -v1.y * scale);
      ctx.lineTo(v2.x * scale, -v2.y * scale);
      break;
    }
    case "chain": {
      const verts = (shape as ChainShape).m_vertices;
      ctx.moveTo(verts[0]!.x * scale, -verts[0]!.y * scale);
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i]!.x * scale, -verts[i]!.y * scale);
      }
      if ((shape as ChainShape).m_isLoop) ctx.closePath();
      break;
    }
  }
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.stroke();
}

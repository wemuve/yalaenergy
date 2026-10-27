/**
 * Minimal ground-plane perspective helper used by the SVG scene components and
 * by the canvas solar-field renderer, so the static artwork and the animated
 * layer agree on where the horizon and the array rows sit.
 */
export interface GroundPlane {
  /** Horizontal position of the vanishing point, in viewBox units. */
  readonly vanishX: number;
  /** Vertical position of the horizon, in viewBox units. */
  readonly horizonY: number;
  /** Half-width of the ground plane per unit of screen depth below horizon. */
  readonly spread: number;
}

/** Half-width of the ground plane at a given screen y. */
export function halfWidthAt(plane: GroundPlane, y: number): number {
  return Math.max(0, (y - plane.horizonY) * plane.spread);
}

/** x of a ground point whose lateral offset is `u` (−1…1) at screen depth `y`. */
export function groundX(plane: GroundPlane, y: number, u: number): number {
  return plane.vanishX + u * halfWidthAt(plane, y);
}

/**
 * Screen y positions for `count` evenly-spaced ground rows between a near and a
 * far plane. Spacing follows 1/z so rows compress toward the horizon the way a
 * real camera renders them.
 */
export function rowDepths(
  nearY: number,
  farY: number,
  horizonY: number,
  count: number,
): number[] {
  const nearDepth = 1 / (nearY - horizonY);
  const farDepth = 1 / (farY - horizonY);
  const rows: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1);
    const depth = nearDepth + (farDepth - nearDepth) * t;
    rows.push(horizonY + 1 / depth);
  }
  return rows;
}

/** SVG polygon points for a ground-plane quad spanning two screen depths. */
export function rowQuad(
  plane: GroundPlane,
  nearY: number,
  farY: number,
  uFrom: number,
  uTo: number,
): string {
  const pts: [number, number][] = [
    [groundX(plane, nearY, uFrom), nearY],
    [groundX(plane, nearY, uTo), nearY],
    [groundX(plane, farY, uTo), farY],
    [groundX(plane, farY, uFrom), farY],
  ];
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

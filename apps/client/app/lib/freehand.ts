import { getStroke } from "perfect-freehand";

const average = (a: number[], b: number[]) => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
];

export function getSvgPathFromStroke(
  strokePoints: number[][],
  closed = true,
): string {
  const len = strokePoints.length;
  if (len < 4) return "";

  let a = strokePoints[0];
  let b = strokePoints[1];
  const c = strokePoints[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b, c)[0].toFixed(2)},${average(b, c)[1].toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = strokePoints[i];
    b = strokePoints[i + 1];
    result += `${average(a, b)[0].toFixed(2)},${average(a, b)[1].toFixed(2)} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}

export function strokeToSvgPath(
  points: { x: number; y: number }[],
  options?: {
    size?: number;
    thinning?: number;
    smoothing?: number;
    streamline?: number;
  },
): string {
  if (!points || points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    const r = (options?.size || 4) / 2;
    return `M ${p.x - r} ${p.y} A ${r} ${r} 0 1 0 ${p.x + r} ${p.y} A ${r} ${r} 0 1 0 ${p.x - r} ${p.y}`;
  }

  const inputPoints = points.map((p) => [p.x, p.y]);
  const strokeOutline = getStroke(inputPoints, {
    size: options?.size ?? 6,
    thinning: options?.thinning ?? 0.5,
    smoothing: options?.smoothing ?? 0.5,
    streamline: options?.streamline ?? 0.5,
    last: true,
  });

  return getSvgPathFromStroke(strokeOutline);
}

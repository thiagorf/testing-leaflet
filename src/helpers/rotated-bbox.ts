import { boundingBox } from "./bounding-box";
import { getCentroid } from "./centroid";
import { rotate } from "./rotate";

export function getRotatedBbox(
  angle: number,
  positions: [number, number][]
): [number, number][] {
  const originalBbox = boundingBox({
    positions: positions,
  });
  const originalCentroid = getCentroid(originalBbox);
  const originalPosition = rotate(-angle, positions, originalCentroid);
  const bbox = boundingBox({ positions: originalPosition });
  const rotatedBbox = rotate(angle, bbox, originalCentroid);

  return rotatedBbox;
}

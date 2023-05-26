import { getBearing } from "./bearing";
import { getCentroid } from "./centroid";
import { getDistance } from "./distance";
import { getDestination } from "./destination";

export function rotate(
  angle: number,
  positions: [number, number][],
  centroid?: number[]
): [number, number][] {
  // Rotation matrix doesn't work well with geographic coordinates
  const anchor = centroid ?? getCentroid(positions);
  const rotatedVertex = positions.map((v): [number, number] => {
    const initialAngle = getBearing({
      startPoint: anchor,
      endPoint: v,
    });
    const distance = getDistance({
      lat: anchor[0],
      long: anchor[1],
      lat1: v[0],
      long1: v[1],
    });

    const [rotatedLat, rotatedLong] = getDestination({
      startPoint: anchor,
      bearing: initialAngle + angle,
      distance,
    });

    return [rotatedLat, rotatedLong];
  });

  return rotatedVertex;
}

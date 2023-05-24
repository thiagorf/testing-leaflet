import { getCentroid } from "./centroid";
import { getDestination } from "./destination";

export function getRotationHandler(
  angle: number,
  bBox: [number, number][],
  distance = 500
) {
  //bbox[1] -> top-left corner, bbox[2] -> top right corner
  const centroidbetweenVertex = getCentroid([bBox[1], bBox[2]]);

  return getDestination({
    startPoint: centroidbetweenVertex,
    bearing: angle, //Bearing = 0 -> N, Bearing = 90 -> E ...
    distance,
  });
}

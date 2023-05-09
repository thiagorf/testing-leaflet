//import pip from "point-in-polygon-hao";
import { SelectedElement } from "../MapElementsControll";

type Point = [number, number];

export function pointInPolygon(point: Point, polygon: SelectedElement) {
  const bbox = polygon.boundingBox;
  const n = bbox.length;
  const lat: number[] = [];
  const long: number[] = [];
  bbox.forEach((b) => (lat.push(b[0]), long.push(b[1])));

  const minLat = Math.min(...lat);
  const maxLat = Math.max(...lat);
  const minLong = Math.min(...long);
  const maxLong = Math.max(...long);
  //0 bl 1 tl 2 br 3 tr
  if (!isInsideBBox(point, { minLat, maxLat, minLong, maxLong })) {
    return false;
  }

  // Initialize a variable to keep track of the number of intersections
  let intersections = 0;
  // Iterate through each edge of the polygon
  for (let i = 0; i < n; i++) {
    const edgeStart = bbox[i];
    const edgeEnd = bbox[(i + 1) % n]; // The modulo operator ensures that the last edge connects to the first edge
    // Check if the ray intersects with the edge
    if (
      edgeStart[1] > point[1] !== edgeEnd[1] > point[1] && // The ray intersects with the edge only if the y-coordinate of the point is between the y-coordinates of the start and end points of the edge
      point[0] <
        ((edgeEnd[0] - edgeStart[0]) * (point[1] - edgeStart[1])) /
          (edgeEnd[1] - edgeStart[1]) +
          edgeStart[0] // The x-coordinate of the intersection point can be calculated using the equation of the line that passes through the edgeStart and edgeEnd points
    ) {
      intersections++;
    }
    // If the number of intersections is odd, the point is inside the polygon
    return intersections % 2 == 0;
  }
}

function isInsideBBox(
  point: Point,
  {
    minLat,
    maxLat,
    minLong,
    maxLong,
  }: { minLat: number; maxLat: number; minLong: number; maxLong: number }
) {
  return (
    point[0] >= minLat &&
    point[0] <= maxLat &&
    point[1] >= minLong &&
    point[1] <= maxLong
  );
}

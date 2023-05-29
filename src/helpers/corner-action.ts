import { ElementPosition } from "./near-point";
import { LAT } from "../constants";
/*
cornerAction(
  [lat, long],
  { coordinates, bbox, middlePoints },
  { handlerPoint, position }
);*/

interface CornersResize {
  cursor: [number, number];
  rotationPoints: {
    coordinates: [number, number][];
    bbox: [number, number][];
    middlePoints: [number, number][];
  };
  corner: {
    handlerPoint: [number, number];
    position: ElementPosition;
    index: number;
  };
}

export function cornerAction(params: CornersResize) {
  const {
    cursor,
    corner: { position, handlerPoint, index },
    rotationPoints: { bbox, coordinates, middlePoints },
  } = params;

  switch (position) {
    case "n":
      {
        const topLeft = bbox[1];
        const topRight = bbox[2];

        const minLat = Math.min(topLeft[LAT], topRight[LAT]);
        const maxLat = Math.max(topLeft[LAT], topRight[LAT]);
        const pointInNorthEdge = checkPointInEdge(coordinates, maxLat, minLat);

        for (const ind of pointInNorthEdge) {
          coordinates[ind][LAT] = cursor[LAT];
        }
        // check if are more than one point in line
        middlePoints[index][LAT] = cursor[LAT];
        bbox[1][LAT] = cursor[LAT];
        bbox[2][LAT] = cursor[LAT];
        // Move rotation point
      }
      break;
    case "s":
      {
        const bottomLeft = bbox[0];
        const bottomRight = bbox[3];

        const minLat = Math.min(bottomLeft[LAT], bottomRight[LAT]);
        const maxLat = Math.max(bottomLeft[LAT], bottomRight[LAT]);

        const pointInSouthEdge = checkPointInEdge(coordinates, maxLat, minLat);

        for (const ind of pointInSouthEdge) {
          coordinates[ind][LAT] = cursor[LAT];
        }

        middlePoints[index][LAT] = cursor[LAT];
        bbox[0][LAT] = cursor[LAT];
        bbox[3][LAT] = cursor[LAT];
      }
      break;
  }
}

function checkPointInEdge(
  coordinates: [number, number][],
  maxLat: number,
  minLat: number
) {
  return coordinates.reduce<number[]>(
    (ac, value, i) =>
      value[0] >= maxLat && value[0] <= minLat ? ac.concat(i) : ac,
    []
  );
}

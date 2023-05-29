import { ElementPosition } from "./near-point";
import { LAT, LONG } from "../constants";
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
        const pointInNorthEdge = checkPointInEdge(
          coordinates,
          maxLat,
          minLat,
          LAT
        );

        for (const ind of pointInNorthEdge) {
          coordinates[ind][LAT] = cursor[LAT];
        }
        // check if are more than one point in line
        middlePoints[index][LAT] = cursor[LAT];
        topLeft[LAT] = cursor[LAT];
        topRight[LAT] = cursor[LAT];
        // Move rotation point
      }
      break;
    case "s":
      {
        const bottomLeft = bbox[0];
        const bottomRight = bbox[3];

        const minLat = Math.min(bottomLeft[LAT], bottomRight[LAT]);
        const maxLat = Math.max(bottomLeft[LAT], bottomRight[LAT]);

        const pointInSouthEdge = checkPointInEdge(
          coordinates,
          maxLat,
          minLat,
          LAT
        );

        for (const ind of pointInSouthEdge) {
          coordinates[ind][LAT] = cursor[LAT];
        }

        middlePoints[index][LAT] = cursor[LAT];
        bottomLeft[LAT] = cursor[LAT];
        bottomRight[LAT] = cursor[LAT];
      }
      break;
    case "w":
      {
        const bottomLeft = bbox[0];
        const topLeft = bbox[1];

        const minLong = Math.min(bottomLeft[LONG], topLeft[LONG]);
        const maxLong = Math.max(bottomLeft[LONG], topLeft[LONG]);

        const pointInWestEdge = checkPointInEdge(
          coordinates,
          maxLong,
          minLong,
          LONG
        );

        for (const ind of pointInWestEdge) {
          coordinates[ind][LONG] = cursor[LONG];
        }
        middlePoints[index][LONG] = cursor[LONG];
        bottomLeft[LONG] = cursor[LONG];
        topLeft[LONG] = cursor[LONG];
      }
      break;
    case "e": {
      const bottomRight = bbox[3];
      const topRight = bbox[2];

      const minLong = Math.min(bottomRight[LONG], topRight[LONG]);
      const maxLong = Math.max(bottomRight[LONG], topRight[LONG]);

      const pointInWestEdge = checkPointInEdge(
        coordinates,
        maxLong,
        minLong,
        LONG
      );

      for (const ind of pointInWestEdge) {
        coordinates[ind][LONG] = cursor[LONG];
      }
      middlePoints[index][LONG] = cursor[LONG];
      bottomRight[LONG] = cursor[LONG];
      topRight[LONG] = cursor[LONG];
    }
  }
}

function checkPointInEdge(
  coordinates: [number, number][],
  max: number,
  min: number,
  coord_type: 0 | 1
) {
  return coordinates.reduce<number[]>(
    (ac, value, i) =>
      value[coord_type] >= max && value[coord_type] <= min ? ac.concat(i) : ac,
    []
  );
}

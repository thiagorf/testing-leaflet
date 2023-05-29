import { getDistance } from "./distance";
import { ElementPosition } from "./near-point";
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
        /*
        const polygonMatch = coordinates.findIndex((p) => {
          return p[0] == cursor[0];
        });

        console.log(polygonMatch);
        if (polygonMatch !== -1) {
          coordinates[polygonMatch][0] = cursor[0];
        }*/
        const topLeft = bbox[1];
        const topRight = bbox[2];

        const minLat = Math.min(topLeft[0], topRight[0]);
        const maxLat = Math.max(topLeft[0], topRight[0]);

        const pointInBoundingBox = coordinates.reduce<number[]>(
          (ac, value, i) =>
            value[0] >= maxLat && value[0] <= minLat ? ac.concat(i) : ac,
          []
        );

        for (const ind of pointInBoundingBox) {
          coordinates[ind][0] = cursor[0];
        }
        // check if are more than one point in line
        middlePoints[index][0] = cursor[0];
        bbox[1][0] = cursor[0];
        bbox[2][0] = cursor[0];
      }
      break;
    case "s":
      middlePoints[index][0] = cursor[0];
      bbox[0][0] = cursor[0];
      bbox[3][0] = cursor[0];
  }
}

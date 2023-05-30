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
        resizeCardinalPoints({
          handler: {
            cursor,
            index,
          },
          edge: {
            start: bbox[1],
            end: bbox[2],
          },
          resize_points: {
            coordinates,
            middlePoints,
          },
          coord_type: LAT,
        });
      }
      break;
    case "s":
      {
        resizeCardinalPoints({
          handler: {
            cursor,
            index,
          },
          edge: {
            start: bbox[0],
            end: bbox[3],
          },
          resize_points: {
            coordinates,
            middlePoints,
          },
          coord_type: LAT,
        });
      }
      break;
    case "w":
      {
        resizeCardinalPoints({
          handler: {
            cursor,
            index,
          },
          edge: {
            start: bbox[0],
            end: bbox[1],
          },
          resize_points: {
            coordinates,
            middlePoints,
          },
          coord_type: LONG,
        });
      }
      break;
    case "e": {
      resizeCardinalPoints({
        handler: {
          cursor,
          index,
        },
        edge: {
          start: bbox[3],
          end: bbox[2],
        },
        resize_points: {
          coordinates,
          middlePoints,
        },
        coord_type: LONG,
      });
    }
  }
}

interface ResizeCardinal {
  handler: {
    cursor: [number, number];
    index: number;
  };
  edge: {
    start: [number, number];
    end: [number, number];
  };
  resize_points: {
    coordinates: [number, number][];
    middlePoints: [number, number][];
  };
  coord_type: 0 | 1;
}

function resizeCardinalPoints(resize: ResizeCardinal) {
  const {
    handler: { cursor, index },
    edge: { start, end },
    coord_type,
    resize_points: { middlePoints, coordinates },
  } = resize;

  const p1 = start;
  const p2 = end;

  const min = Math.min(p1[coord_type], p2[coord_type]);
  const max = Math.max(p1[coord_type], p2[coord_type]);

  const pointInWestEdge = checkPointInEdge(coordinates, max, min, coord_type);

  for (const ind of pointInWestEdge) {
    coordinates[ind][coord_type] = cursor[coord_type];
  }
  middlePoints[index][coord_type] = cursor[coord_type];
  p1[coord_type] = cursor[coord_type];
  p2[coord_type] = cursor[coord_type];
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

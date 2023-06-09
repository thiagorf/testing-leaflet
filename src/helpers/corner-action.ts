import { ElementPosition } from "./near-point";
import { LAT, LONG } from "../constants";
import { getDistance } from "./distance";

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

  const distanceBetweenEdges = Math.floor(
    getDistance({
      lat: p1[LAT],
      long: p1[LONG],
      lat1: p2[LAT],
      long1: p2[LONG],
    })
  );

  const pointInEdge = coordinates.reduce<number[]>((ac, p, i) => {
    const p1ToPoint = getDistance({
      lat: p1[LAT],
      long: p1[LONG],
      lat1: p[LAT],
      long1: p[LONG],
    });
    const p2ToPoint = getDistance({
      lat: p2[LAT],
      long: p2[LONG],
      lat1: p[LAT],
      long1: p[LONG],
    });

    const sumOfPoints = Math.floor(p1ToPoint + p2ToPoint);

    if (sumOfPoints - distanceBetweenEdges <= 50) {
      return ac.concat(i);
    }
    return ac;
  }, []);

  for (const ind of pointInEdge) {
    coordinates[ind][coord_type] = cursor[coord_type];
  }
  middlePoints[index][coord_type] = cursor[coord_type];
  p1[coord_type] = cursor[coord_type];
  p2[coord_type] = cursor[coord_type];
}

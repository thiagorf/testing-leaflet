import { ElementPosition } from "./near-point";
import { LAT, LONG } from "../constants";
import { getDistance } from "./distance";
import { getCentroid } from "./centroid";
import { getDestination } from "./destination";
import { toRad } from "./to-radians";
import { getBearing } from "./bearing";

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
        const bottomLeft = bbox[0];
        const bottomRight = bbox[2];

        //const bboxHeight = bottomRight[LAT] - bottomLeft[LAT];
        //const newHeight = bottomRight[LAT] - cursor[LAT];

        //const fac = newHeight / bboxHeight;

        /*
        const diff = Math.abs(cursor[LAT] - middlePoints[index][LAT]);
        const avg = (cursor[LAT] + middlePoints[index][LAT]) / 2;
        const inc = diff / avg;
        const fac = cursor[LAT] > middlePoints[index][LAT] ? 1 + inc : 1 - inc;
        */
        /*
        coordEach(feature, function (coord) {
        var originalDistance = rhumbDistance(origin, coord);
        var bearing = rhumbBearing(origin, coord);
        var newDistance = originalDistance * factor;
        var newCoord = getCoords(rhumbDestination(origin, newDistance, bearing));
        coord[0] = newCoord[0];
        coord[1] = newCoord[1];
        if (coord.length === 3) coord[2] *= factor;
      });
            */
        //const fac = cursor[LAT] - middlePoints[3][LAT];

        const initialHeight = getDistance(bottomLeft, topLeft);
        const newHeight = getDistance(bottomLeft, [cursor[LAT], topLeft[LONG]]);
        const fac = newHeight / initialHeight;

        console.log(fac);
        topLeft[LAT] = cursor[LAT];
        topRight[LAT] = cursor[LAT];
        middlePoints[index][LAT] = cursor[LAT];
        const centroid = getCentroid(bbox);
        const off = getBearing({
          startPoint: centroid,
          endPoint: cursor,
        });
        coordinates.forEach((p) => {
          if (p[LAT] !== bottomLeft[LAT]) {
            const d = getDistance(middlePoints[3], p);
            const b = getBearing({
              startPoint: middlePoints[3],
              endPoint: p,
            });
            const offset = b - off;
            console.log(offset);
            const scaled = d * fac;
            const dest = getDestination({
              startPoint: middlePoints[3],
              bearing: b,
              distance: scaled,
            });
            p[LAT] = dest[LAT];
          }
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

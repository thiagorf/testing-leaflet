import { ElementPosition } from "./near-point";
import { LAT, LONG } from "../constants";
import { getDistance } from "./distance";
import { getCentroid } from "./centroid";
import { getDestination } from "./destination";
import { getBearing } from "./bearing";
import { getPolygonMeasurements } from "./polygon-measurements";

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

  if (position == "n") {
    let topLeft = bbox[1];
    let topRight = bbox[2];
    let bottomLeft = bbox[0];
    let bottomRight = bbox[3];
    let anchor = middlePoints[index];

    /*
            If the initialHeight is 0, assign the new height to the initial heigth
            initialHeight / newHeight
            positive number / 0 = Infinity
        */

    // Original height
    const initialHeight = getDistance(bottomLeft, topLeft);
    // Height + cursor positions = newHeight
    const newHeight = getDistance(bottomLeft, [cursor[LAT], topLeft[LONG]]);

    // scale factor
    let fac = newHeight / initialHeight;

    if (fac === Infinity || isNaN(fac)) {
      fac = 1;
    }
    const elementSize = getPolygonMeasurements(coordinates);

    const centroid = getCentroid(bbox);

    //The point where the polygon will scale or reflect
    let homotheticCenter = middlePoints[3];
    //Check if the north anchor intersects the south anchor
    const aq = getBearing({
      startPoint: [cursor[LAT], anchor[LONG]],
      endPoint: centroid,
    });
    /*
            When the element has a size of 50, it should start
            resizing on the other direction
        */
    //check if the bug occurs when the north pass the south anchor
    console.log(elementSize.height);
    const abs = Math.abs(aq);
    console.log(abs);
    // between 50 - 100 height
    if (elementSize.height <= 0 || abs == 0 || abs == 360) {
      //fac = -Math.abs(fac);
    }
    const resizedCoordinates = coordinates.map<[number, number]>((p) => {
      const d = getDistance(p, homotheticCenter);
      const b = getBearing({
        startPoint: homotheticCenter,
        endPoint: p,
      });
      const scaled = d * fac;
      const dest = getDestination({
        startPoint: homotheticCenter,
        bearing: b,
        distance: scaled,
      });
      //fix bottom vertex after certain height
      //p[LAT] = dest[LAT];

      return [dest[LAT], p[LONG]];
    });

    return resizedCoordinates;

    //const delta = cursor[LAT] - anchor[LAT];
    /*
    topLeft[LAT] += delta;
    topRight[LAT] += delta;
    anchor[LAT] += delta;
  */
  }
}

/*
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
}*/

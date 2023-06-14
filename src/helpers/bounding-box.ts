import { PolyInfo } from "../MapElementsControll";
import { LAT, LONG } from "../constants";
import { getBearing } from "./bearing";
import { getCentroid } from "./centroid";
import { getDestination } from "./destination";
import { getDistance } from "./distance";

type BoundingBoxCoordinates = Pick<PolyInfo, "positions">;

const HANDLER_SIZE = 60;
// N -> E -> S -> W
const cardinalPositions = [0, 90, 180, 270];

export function boundingBox(
  coordinates: BoundingBoxCoordinates
): [number, number][] {
  const lat: number[] = [],
    long: number[] = [];

  const positions = coordinates.positions;

  const handlersBbox = positions
    .map((p) => {
      return cardinalPositions.map<[number, number]>((handler) => {
        const [dlat, dlong] = getDestination({
          startPoint: p,
          distance: HANDLER_SIZE,
          bearing: handler,
        });

        return [dlat, dlong];
      });
    })
    .flat();

  [...positions, ...handlersBbox].forEach(
    (x) => (lat.push(x[0]), long.push(x[1]))
  );

  const minLat = Math.min(...lat);
  const maxLat = Math.max(...lat);
  const minLong = Math.min(...long);
  const maxLong = Math.max(...long);
  // min|min -> bl, max|min -> tl, max|max -> tr, min|max -> br

  const bbox: [number, number][] = [
    [minLat, minLong],
    [maxLat, minLong],
    [maxLat, maxLong],
    [minLat, maxLong],
  ];

  return bbox;

  /*
  const centroid = getCentroid(bbox);

  const bboxWithPadding = bbox.map<[number, number]>((p) => {
    const cornerAngle = getBearing({
      startPoint: centroid,
      endPoint: p,
    });
    const paddingCorner = getDestination({
      startPoint: p,
      bearing: cornerAngle,
      distance: 100,
    });

    return [paddingCorner[LAT], paddingCorner[LONG]];
  });

  return bboxWithPadding;
  */
  /*
  return [
    [minLat, maxLong],
    [maxLat, maxLong],
    [maxLat, minLong],
    [minLat, minLong],
  ];
  */
}

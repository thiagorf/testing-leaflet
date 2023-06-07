import { PolyInfo } from "../MapElementsControll";

type BoundingBoxCoordinates = Pick<PolyInfo, "positions">;

export function boundingBox(
  coordinates: BoundingBoxCoordinates
): [number, number][] {
  const lat: number[] = [],
    long: number[] = [];

  coordinates.positions.forEach((x) => (lat.push(x[0]), long.push(x[1])));

  const minLat = Math.min(...lat);
  const maxLat = Math.max(...lat);
  const minLong = Math.min(...long);
  const maxLong = Math.max(...long);
  // min|min -> bl, max|min -> tl, max|max -> tr, min|max -> br
  return [
    [minLat, minLong],
    [maxLat, minLong],
    [maxLat, maxLong],
    [minLat, maxLong],
  ];

  /*
  return [
    [minLat, maxLong],
    [maxLat, maxLong],
    [maxLat, minLong],
    [minLat, minLong],
  ];
  */
}

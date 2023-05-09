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

  // required coordinates: [minLat, maxLog], [maxLat, minLong]

  return [
    [minLat, maxLong],
    [maxLat, maxLong],
    [minLat, minLong],
    [maxLat, minLong],
  ];
}

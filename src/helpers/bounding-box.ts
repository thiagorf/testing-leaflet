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

  //console.log(minLat, maxLat, minLong, maxLong);
  // required coordinates: [minLat, maxLog], [maxLat, minLong]

  /*
  const { positions } = coordinates;
  let minLat = positions[0][0];
  let maxLat = positions[0][0];
  let minLong = positions[0][1];
  let maxLong = positions[0][1];

  for (let i = 0; i < positions.length; i++) {
    const [lat, long] = positions[i];

    if (lat < minLat) {
      minLat = lat;
    } else if (lat > maxLat) {
      maxLat = lat;
    }
    if (long < minLong) {
      minLong = long;
    } else if (long > maxLong) {
      maxLong = long;
    }
  }
*/
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

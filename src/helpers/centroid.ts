type CentroidNCoordinates = [number, number][];

export function getCentroid(coordinates: CentroidNCoordinates) {
  const polygonLength = coordinates.length;
  const sumOfLat = coordinates.reduce((arr, value) => (arr += value[0]), 0);
  const sumOfLong = coordinates.reduce((arr, value) => (arr += value[1]), 0);

  const centroid = [sumOfLat / polygonLength, sumOfLong / polygonLength];

  return centroid;
}

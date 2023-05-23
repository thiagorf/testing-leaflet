type CentroidNCoordinates = [number, number][];

export function getCentroid(coordinates: CentroidNCoordinates) {
  const polygonLength = coordinates.length;

  const sumOfCoordinates = coordinates.reduce(
    (arr, value) => [(arr[0] += value[0]), (arr[1] += value[1])],
    [0, 0]
  );
  const centroid = [
    sumOfCoordinates[0] / polygonLength,
    sumOfCoordinates[1] / polygonLength,
  ];

  return centroid;
}

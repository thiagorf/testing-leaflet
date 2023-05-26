export function getMiddlepointBbox(bBox: [number, number][]) {
  const middlePoints: [number, number][] = [];
  const length = bBox.length;

  for (let i = 0; i < length; i++) {
    const offset = (i + 1) % length;

    const [mLat, mLong] = [
      (bBox[i][0] + bBox[offset][0]) / 2,
      (bBox[i][1] + bBox[offset][1]) / 2,
    ];
    middlePoints.push([mLat, mLong]);
  }

  return middlePoints;
}

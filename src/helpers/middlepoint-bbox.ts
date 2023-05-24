export function getMiddlepointBbox(bBox: [number, number][]) {
  const middlePoints: [number, number][] = [];
  for (let i = 0; i < bBox.length; i++) {
    let offset = 1;
    if (typeof bBox[i + offset] === "undefined") {
      offset = -(bBox.length - 1);
    }
    const [mLat, mLong] = [
      (bBox[i][0] + bBox[i + offset][0]) / 2,
      (bBox[i][1] + bBox[i + offset][1]) / 2,
    ];
    middlePoints.push([mLat, mLong]);
  }

  return middlePoints;
}

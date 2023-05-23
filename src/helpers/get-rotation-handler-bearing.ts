type BBox = number[][];
type BearingAngle = 0 | 90 | 180 | 360;

export function getRotationHanlderBearing(bbox: BBox): BearingAngle {
  //main side = North of the bounding box
  const [oppositeSideStart, mainSideStart, mainSideEnd, oppositeSideEnd] = bbox;
  // x == Long, y == lat
  const equalLat = mainSideStart[0] === mainSideEnd[0];
  const equalLong = mainSideStart[1] === mainSideEnd[1];
  if (
    equalLat &&
    oppositeSideStart[0] > mainSideStart[0] ===
      oppositeSideEnd[0] > mainSideEnd[0]
  ) {
    return 0;
  } else if (
    equalLong &&
    oppositeSideStart[1] < mainSideStart[1] ===
      oppositeSideEnd[1] < mainSideEnd[1]
  ) {
    return 90;
  } else if (
    equalLat &&
    oppositeSideStart[0] < mainSideStart[0] ===
      oppositeSideEnd[0] < mainSideEnd[0]
  ) {
    return 180;
  } else if (
    equalLong &&
    oppositeSideStart[1] > mainSideStart[1] ===
      oppositeSideEnd[1] > mainSideEnd[1]
  ) {
    return 360;
  } else {
    return 0;
  }
}

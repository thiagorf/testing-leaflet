type BearingAngleCoodinates = {
  startPoint: number[];
  endPoint: number[];
};

export function getBearing({ startPoint, endPoint }: BearingAngleCoodinates) {
  const y = Math.sin(endPoint[1] - startPoint[1]) * Math.cos(endPoint[0]);
  const x =
    Math.cos(startPoint[0]) * Math.sin(endPoint[0]) -
    Math.sin(startPoint[0]) *
      Math.cos(endPoint[0]) *
      Math.cos(endPoint[1] - startPoint[1]);

  const o = Math.atan2(y, x);

  const bearing = ((o * 180) / Math.PI + 360) % 360;

  return bearing;
}

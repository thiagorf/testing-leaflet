import { toDegrees } from "./to-degrees";
import { toRad } from "./to-radians";

type BearingAngleCoodinates = {
  startPoint: number[];
  endPoint: number[];
};

export function getBearing({ startPoint, endPoint }: BearingAngleCoodinates) {
  const startLat = toRad(startPoint[0]);
  const startLong = toRad(startPoint[1]);

  const endLat = toRad(endPoint[0]);
  const endLong = toRad(endPoint[1]);

  const y = Math.sin(endLong - startLong) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLong - startLong);

  const o = Math.atan2(y, x);
  const bearing = (toDegrees(o) + 360) % 360;

  return bearing;
}

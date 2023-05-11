import { toRad } from "./to-radians";

interface HaversineParams {
  lat: number;
  long: number;
  lat1: number;
  long1: number;
}
const R = 6371;

export function distanceBetweenCoordinates({
  lat,
  long,
  lat1,
  long1,
}: HaversineParams): number {
  const x1 = lat1 - lat;
  const distanceLat = toRad(x1);
  const x2 = long1 - long;
  const distanceLong = toRad(x2);

  //  haversine formula
  const a =
    Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
    Math.cos(toRad(lat)) *
      Math.cos(toRad(lat1)) *
      Math.sin(distanceLong / 2) *
      Math.sin(distanceLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // * 1000 -> to kilometers
  const d = R * c * 1000;
  return d;
}

import { toRad } from "./to-radians";

type DestinationCoordinates = {
  startPoint: number[];
  bearing: number;
  distance: number;
};

export function getDestination({
  startPoint,
  bearing,
  distance,
}: DestinationCoordinates) {
  /*
     *φ2 = asin( sin φ1 ⋅ cos δ + cos φ1 ⋅ sin δ ⋅ cos θ )
	λ2 = λ1 + atan2( sin θ ⋅ sin δ ⋅ cos φ1, cos δ − sin φ1 ⋅ sin φ2 )
where 	φ is latitude, 
        λ is longitude, 
        θ is the bearing (clockwise from north), 
        δ is the angular distance d/R; 
        d being the distance travelled, R the earth’s radius
     * */
  const d = distance / 1000;
  const r = 6371;
  const o = d / r;
  const O = o;
  const b = toRad(bearing);
  const lat = toRad(startPoint[0]);
  const long = toRad(startPoint[1]);

  const sinLat2 =
    Math.sin(lat) * Math.cos(O) + Math.cos(lat) * Math.sin(O) * Math.cos(b);
  const targetLatitude = Math.asin(sinLat2);
  const targetLongitude =
    long +
    Math.atan2(
      Math.sin(b) * Math.sin(O) * Math.cos(lat),
      Math.cos(O) - Math.sin(lat) * Math.sin(sinLat2)
    );

  return [toDegrees(targetLatitude), toDegrees(targetLongitude)];
}

function toDegrees(n: number) {
  return (n * 180) / Math.PI;
}

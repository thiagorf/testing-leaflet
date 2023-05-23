import { toDegrees } from "./to-degrees";
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
    Formula
    φ2 = asin( sin φ1 ⋅ cos δ + cos φ1 ⋅ sin δ ⋅ cos θ )
	λ2 = λ1 + atan2( sin θ ⋅ sin δ ⋅ cos φ1, cos δ − sin φ1 ⋅ sin φ2 )
*/
  /*    where 	
        φ is latitude, 
        λ is longitude, 
        θ is the bearing (clockwise from north), 
        δ is the angular distance d/R; 
        d being the distance travelled, R the earth’s radius
 */
  //distance in meters
  const d = distance / 1000;
  //earth radius
  const r = 6371;
  const o = d / r;
  const O = o;
  //Bearing angle in radians
  const b = toRad(bearing);
  //Lat and Long in radians
  const lat = toRad(startPoint[0]);
  const long = toRad(startPoint[1]);

  const sinLat2 =
    Math.sin(lat) * Math.cos(O) + Math.cos(lat) * Math.sin(O) * Math.cos(b);
  //Latitude in Radians
  const targetLatitude = Math.asin(sinLat2);
  //Longitude in Radians
  const targetLongitude =
    long +
    Math.atan2(
      Math.sin(b) * Math.sin(O) * Math.cos(lat),
      Math.cos(O) - Math.sin(lat) * Math.sin(targetLatitude)
    );
  //Convert to required fromat
  return [toDegrees(targetLatitude), toDegrees(targetLongitude)];
}

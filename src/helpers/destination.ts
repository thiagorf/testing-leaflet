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

  const r = 6371;
  const targetLatitude = Math.asin(
    Math.sin(startPoint[0]) * Math.cos(distance / r) +
      Math.cos(startPoint[0]) * Math.sin(distance / r) * Math.cos(bearing)
  );
  const targetLongitude =
    startPoint[1] +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / r) * Math.cos(startPoint[0]),
      Math.cos(distance / r) -
        Math.sin(startPoint[0]) * Math.sin(targetLatitude)
    );
  return [targetLatitude, targetLongitude];
}

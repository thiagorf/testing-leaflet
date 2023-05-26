import { getDistance } from "./distance";
//Check if the cutsor is inside the polygon
//but before that check if is around of the corners
//SW | W | NW | N | NE | E | SE | S
//if is not around this corners is probaly inside
//if not maybe is around the rotation handler
//or inside but clone to the polygon vertex

export type ElementPosition =
  | "bl"
  | "w"
  | "tl"
  | "n"
  | "tr"
  | "e"
  | "br"
  | "s"
  | "rotation";

interface CornerMatch {
  corner: [number, number];
  cornerPosition: ElementPosition;
}

export function nearPoint(
  cursor: [number, number],
  bBoxMiddlePoints: [number, number][],
  bBox: [number, number][],
  rotationPoint: [number, number]
): CornerMatch {
  // bl -> W -> tl -> N -> tr -> E -> tb -> S
  const order: [number, number][] = bBox.flatMap((b, i) => [
    b,
    bBoxMiddlePoints[i],
  ]);
  order.push(rotationPoint);

  const elementPositions = [
    "bl",
    "w",
    "tl",
    "n",
    "tr",
    "e",
    "br",
    "s",
    "rotation",
  ] as const;

  const match = order.findIndex((m) => {
    const d = getDistance({
      lat: cursor[0],
      long: cursor[1],
      lat1: m[0],
      long1: m[1],
    });

    return d <= 65;
  });
  return {
    corner: order[match],
    cornerPosition: elementPositions[match],
  };
}

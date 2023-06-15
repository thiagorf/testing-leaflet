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
  corner: [number, number] | undefined;
  cornerIndex: number | undefined;
  cornerPosition: ElementPosition | undefined;
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
    ["bl", 0],
    ["w", 0],
    ["tl", 1],
    ["n", 1],
    ["tr", 2],
    ["e", 2],
    ["br", 3],
    ["s", 3],
    ["rotation", 0],
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

  if (match === -1) {
    return {
      corner: undefined,
      cornerIndex: undefined,
      cornerPosition: undefined,
    };
  }

  // Clockwise order
  // Bounding box = bl, tl, tr , br
  // Middle points = w, n, e, s
  // Complete bounding box = bl, w, tl, n, tr, e, br, s
  return {
    corner: order[match],
    cornerIndex: elementPositions[match][1], // 1 -> index in the clockwise order (bl = index 0, tl = index 1 ...),
    cornerPosition: elementPositions[match][0], //0 -> which corner,
  };
}

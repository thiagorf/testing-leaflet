export function matrixRotation(angle: number, positions: [number, number][]) {
  const angleInRadians = (angle * Math.PI) / 180;

  const cosTheta = Math.cos(angleInRadians);
  const sinTheta = Math.sin(angleInRadians);

  const rotationMatrix = [
    [cosTheta, -sinTheta],
    [sinTheta, cosTheta],
  ];

  return positions.map((v) => [
    v[0] * rotationMatrix[0][0] + v[1] * rotationMatrix[0][1],
    v[0] * rotationMatrix[1][0] + v[1] * rotationMatrix[1][1],
  ]);
}

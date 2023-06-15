import {
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  Circle,
  Polygon,
} from "react-leaflet";
import "./App.css";
import { ChangeEvent, useState } from "react";
import { nanoid } from "nanoid";
import { getDistance } from "./helpers/distance";
import { pointInPolygon } from "./helpers/point-in-polygon";
import { getCentroid } from "./helpers/centroid";
import { getBearing } from "./helpers/bearing";
import { rotate } from "./helpers/rotate";
import deepClone from "lodash.clonedeep";
import { getRotatedBbox } from "./helpers/rotated-bbox";
import { getRotationHandler } from "./helpers/rotation-handler";
import { getMiddlepointBbox } from "./helpers/middlepoint-bbox";
import { ElementPosition, nearPoint } from "./helpers/near-point";
import { cornerAction } from "./helpers/corner-action";
import { boundingBox } from "./helpers/bounding-box";
import { PathOptions } from "leaflet";
import { LAT, LONG } from "./constants";

const handlerOptions: PathOptions = {
  color: "#373737",
  weight: 1,
  fillColor: "#F8F8FF",
  fillOpacity: 1,
  stroke: true,
};

export enum CursorModes {
  none = "none",
  marker = "marker",
  circle = "circle",
  poly = "poly",
  selection = "selection",
  resize = "resize",
  rotation = "rotation",
}

enum PolyTypes {
  polyline = "polyline",
  polygon = "polygon",
}

interface MapCoordinates {
  lat: number;
  long: number;
}

interface ElementsBaseData extends MapCoordinates {
  id: string;
}

export interface PolyInfo {
  id: string;
  type: CursorModes.poly;
  subtype: PolyTypes;
  angle: number;
  positions: [number, number][];
}

interface MarkerInfo extends ElementsBaseData {
  type: CursorModes.marker;
  description: string;
}

interface CircleInfo extends ElementsBaseData {
  type: CursorModes.circle;
  radius: number;
}

type MapElements = MarkerInfo | CircleInfo | PolyInfo;

export type SelectedElement = MapElements & {
  boundingBox: [number, number][];
  bBoxMiddlePoints: [number, number][];
  lastPosition: [number, number];
  rotationPoint: [number, number];
};

interface SourceTargetData {
  _latlngs: { lat: number; lng: number }[];
}

type CursorDispatch = React.Dispatch<React.SetStateAction<CursorModes>>;

interface Handler {
  index: number;
  handlerPoint?: [number, number];
  position: ElementPosition | "vertex";
}

export function MapElementsControll(props: {
  cursorMode: CursorModes;
  setMode: CursorDispatch;
}) {
  const [markers, setMarkers] = useState<MapElements[]>([]);
  const [selected, setSelected] = useState<SelectedElement>();
  const [lastSelectedId, setLastSelectedId] = useState<string>();
  const [polyCoordinates, setPolyCoordinates] = useState<
    [number, number][] | null
  >(null);
  const [polyStatus, setPolyStatus] = useState<"selecting" | "creating">(
    "creating"
  );
  const [handler, setHandler] = useState<Handler | null>(null);

  function resetPolyData() {
    setLastSelectedId("");
    setPolyStatus("creating");
    setPolyCoordinates(null);
    props.setMode(CursorModes.none);
  }

  const map = useMapEvents({
    mousedown(e) {
      const { lat, lng } = e.latlng;
      if (props.cursorMode === CursorModes.none) {
        const markersCopy = [...markers];
        const polygonMatch = markersCopy.find((m) => {
          if (m.type === CursorModes.poly) {
            return pointInPolygon([lat, lng], m.positions);
          }
        });
        if (polygonMatch !== undefined) {
          if (polygonMatch.type === CursorModes.poly) {
            if (selected && selected.type == CursorModes.poly) {
              const [lat1, long1] = selected.rotationPoint;
              const { corner, cornerIndex, cornerPosition } = nearPoint(
                [lat, lng],
                selected.bBoxMiddlePoints,
                selected.boundingBox,
                [lat1, long1]
              );
              if (cornerPosition == "rotation") {
                props.setMode(CursorModes.rotation);
              } else if (
                corner !== undefined &&
                cornerPosition !== undefined &&
                cornerIndex !== undefined
              ) {
                props.setMode(CursorModes.resize);
                setHandler({
                  index: cornerIndex,
                  handlerPoint: corner,
                  position: cornerPosition,
                });
              } else {
                const onPointIndex = selected.positions.findIndex((v) => {
                  const d = getDistance([lat, lng], v);

                  return d <= 60;
                });
                if (onPointIndex >= 0) {
                  setHandler({ index: onPointIndex, position: "vertex" });
                  props.setMode(CursorModes.resize);
                }
              }
            } else {
              const rotatedBbox = getRotatedBbox(
                polygonMatch.angle,
                polygonMatch.positions
              );
              const [dLat, dLong] = getRotationHandler(
                polygonMatch.angle,
                rotatedBbox
              );
              const middlePoints = getMiddlepointBbox(rotatedBbox);

              setSelected({
                ...polygonMatch,
                boundingBox: rotatedBbox,
                lastPosition: [lat, lng],
                rotationPoint: [dLat, dLong],
                bBoxMiddlePoints: middlePoints,
              });
              props.setMode(CursorModes.selection);
            }
          }
        }
      }
      if (selected && selected.type === CursorModes.poly) {
      }
      if (props.cursorMode == CursorModes.circle) {
        setMarkers((prev) => {
          const id = nanoid();
          setLastSelectedId(id);
          return [
            ...prev,
            {
              id,
              type: CursorModes.circle,
              lat: lat,
              long: lng,
              radius: 0,
            },
          ];
        });
      }

      if (props.cursorMode == CursorModes.poly) {
        if (polyCoordinates) {
          const elementsCopy = [...markers];
          const selectedElementIndex = elementsCopy.findIndex(
            (m) => m.id === lastSelectedId
          );
          const element = elementsCopy[selectedElementIndex];
          if (element.type == CursorModes.poly) {
            const lastElementIndex = element.positions.length - 1;
            const [lat1, long1] = element.positions[lastElementIndex - 1];
            const [firstPointLat, firstPointLong] = element.positions[0];
            const distanceForTheLastPoint = getDistance(
              [lat, lng],
              [lat1, long1]
            );

            const distanceFotTheFirstPoint = getDistance(
              [lat, lng],
              [firstPointLat, firstPointLong]
            );

            if (distanceForTheLastPoint <= 65 && element.positions.length > 2) {
              element.positions = element.positions.slice(0, lastElementIndex);
              setMarkers(elementsCopy);
              resetPolyData();
            } else if (
              distanceFotTheFirstPoint <= 65 &&
              element.positions.length >= 3
            ) {
              element.positions = element.positions.slice(0, lastElementIndex);
              element.subtype = PolyTypes.polygon;
              setMarkers(elementsCopy);
              resetPolyData();
            } else {
              element.positions[lastElementIndex] = [lat, lng];
              setMarkers(elementsCopy);
              setPolyCoordinates(element.positions);
              setPolyStatus("creating");
            }
          }
        } else {
          setMarkers((prev) => {
            const id = nanoid();
            setLastSelectedId(id);

            const actualPositions: [number, number][] = [[lat, lng]];

            setPolyCoordinates(actualPositions);

            return [
              ...prev,
              {
                id,
                type: CursorModes.poly,
                subtype: PolyTypes.polyline,
                positions: actualPositions,
                angle: 0,
              },
            ];
          });
        }
      }
    },
    mousemove(e) {
      const { lat, lng: long } = e.latlng;

      if (props.cursorMode === CursorModes.rotation && selected) {
        const selectedCopy = deepClone(selected);
        const markersCopy = deepClone(markers);
        const elementIndex = markersCopy.findIndex(
          (i) => i.id === selectedCopy.id
        );
        const element = markersCopy[elementIndex];
        if (selectedCopy.type && element.type === CursorModes.poly) {
          const { boundingBox: bBox, rotationPoint } = selectedCopy;
          const centroid = getCentroid(bBox);
          const cursorAngle = getBearing({
            startPoint: centroid,
            endPoint: [lat, long],
          });
          const rotationHandlerAngle = getBearing({
            startPoint: centroid,
            endPoint: rotationPoint,
          });
          const offsetAngle = cursorAngle - rotationHandlerAngle;

          const [rotatedPoint] = rotate(offsetAngle, [rotationPoint], centroid);
          const rotatedPositions = rotate(
            offsetAngle,
            element.positions,
            centroid
          );
          const rotatedBbox = rotate(offsetAngle, bBox, centroid);
          selectedCopy.rotationPoint = [rotatedPoint[0], rotatedPoint[1]];
          element.positions = rotatedPositions;
          element.angle = rotationHandlerAngle;
          if (selectedCopy.type === CursorModes.poly)
            selectedCopy.positions = rotatedPositions;
          selectedCopy.boundingBox = rotatedBbox;
        }
        setSelected(selectedCopy);
        setMarkers(markersCopy);
      }
      if (props.cursorMode === CursorModes.selection) {
        if (selected) {
          const { lastPosition } = selected;
          const offset = [lat - lastPosition[0], long - lastPosition[1]];
          const selectedCopy = { ...selected };
          selectedCopy.boundingBox = selectedCopy.boundingBox.map(
            (coordinates) => [
              coordinates[0] + offset[0],
              coordinates[1] + offset[1],
            ]
          );
          const { rotationPoint } = selectedCopy;
          selectedCopy.rotationPoint = [
            rotationPoint[0] + offset[0],
            rotationPoint[1] + offset[1],
          ];
          selectedCopy.lastPosition = [lat, long];

          const markersCopy = [...markers];
          const selectedIndex = markersCopy.findIndex(
            (m) => m.id === selected.id
          );

          const element = markersCopy[selectedIndex];
          if (
            selectedCopy.type === CursorModes.poly &&
            element.type === CursorModes.poly
          ) {
            element.positions = selectedCopy.positions.map((coordinates) => [
              coordinates[0] + offset[0],
              coordinates[1] + offset[1],
            ]);

            selectedCopy.positions = element.positions;
          }

          setSelected(selectedCopy);
          setMarkers(markersCopy);
        }
      } else if (props.cursorMode === CursorModes.resize) {
        if (selected && selected.type == CursorModes.poly) {
          if (handler) {
            const { position, index, handlerPoint } = handler;
            const selectedCopy = deepClone(selected);
            const markersCopy = deepClone(markers);
            const selectedIndex = markersCopy.findIndex(
              (m) => m.id === selected.id
            );
            const element = markersCopy[selectedIndex];
            if (position == "vertex") {
              selectedCopy.positions[index] = [lat, long];

              const rotatedBbox = getRotatedBbox(
                selectedCopy.angle,
                selectedCopy.positions
              );

              const [dLat, dLong] = getRotationHandler(
                selectedCopy.angle,
                rotatedBbox
              );
              selectedCopy.boundingBox = rotatedBbox;
              selectedCopy.rotationPoint = [dLat, dLong];
              if (element.type == CursorModes.poly) {
                element.positions = [...selectedCopy.positions];
              }
            } else {
              if (element.type == CursorModes.poly) {
                if (handlerPoint !== undefined) {
                  //Mutate passed objects by reference
                  cornerAction({
                    cursor: [lat, long],
                    rotationPoints: {
                      coordinates: selectedCopy.positions,
                      bbox: selectedCopy.boundingBox,
                      middlePoints: selectedCopy.bBoxMiddlePoints,
                    },
                    corner: { handlerPoint, position, index },
                  });
                  element.positions = [...selectedCopy.positions];
                  const rPoint = getRotationHandler(
                    element.angle,
                    selectedCopy.boundingBox
                  );
                  selectedCopy.rotationPoint = [rPoint[LAT], rPoint[LONG]];
                }
              }
            }
            setSelected(selectedCopy);
            setMarkers(markersCopy);
          }
        }
      } else if (props.cursorMode == CursorModes.circle && lastSelectedId) {
        const elementsCopy = [...markers];
        const selectedElementIndex = elementsCopy.findIndex(
          (m) => m.id === lastSelectedId
        );
        const element = elementsCopy[selectedElementIndex];
        // assert marker type
        if (element.type == CursorModes.circle) {
          const { lat: lat1, long: long1 } = element;

          const d = getDistance([lat, long], [lat1, long1]);

          element.radius = d;
          setMarkers(elementsCopy);
        }
      }

      if (props.cursorMode == CursorModes.poly && lastSelectedId) {
        const elementsCopy = [...markers];
        const selectedElementIndex = elementsCopy.findIndex(
          (m) => m.id === lastSelectedId
        );
        const element = elementsCopy[selectedElementIndex];

        if (element.type == CursorModes.poly) {
          if (polyCoordinates && polyStatus == "creating") {
            element.positions = [...polyCoordinates, [lat, long]];
            setPolyCoordinates(element.positions);
            setPolyStatus("selecting");
          }

          if (polyCoordinates && polyStatus == "selecting") {
            const lc = [...polyCoordinates];
            lc[lc.length - 1] = [lat, long];
            element.positions = lc;

            setPolyCoordinates(lc);
          }
        }
      }
    },
    mouseup() {
      if (props.cursorMode == CursorModes.circle) {
        setLastSelectedId("");
      } else if (props.cursorMode == CursorModes.resize) {
        setHandler(null);
        /*
        const copy = deepClone(selected);
        if (copy) {
          const adjustBbox = boundingBox({ positions: copy.boundingBox });
          copy.boundingBox = adjustBbox;
        }
        setSelected(copy);*/
        props.setMode(CursorModes.none);
      } else if (props.cursorMode == CursorModes.selection) {
        props.setMode(CursorModes.none);
      } else if (props.cursorMode === CursorModes.rotation) {
        props.setMode(CursorModes.none);
      }
    },
    click(e) {
      const { lat, lng } = e.latlng;
      if (props.cursorMode == CursorModes.marker) {
        setMarkers((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: CursorModes.marker,
            lat: lat,
            long: lng,
            description: "",
          },
        ]);
      }
    },
  });
  if (props.cursorMode !== CursorModes.none) {
    map.dragging.disable();
  } else {
    map.dragging.enable();
  }

  function markerInputHandler({
    e,
    markerId,
  }: {
    e: ChangeEvent<HTMLInputElement>;
    markerId: string;
  }) {
    const copyMarkers = [...markers];
    const selectedMarkerIndex = copyMarkers.findIndex(
      (marker) => marker.id == markerId
    );
    const selectedMarkerElement = copyMarkers[selectedMarkerIndex];
    if (selectedMarkerElement.type == CursorModes.marker) {
      selectedMarkerElement.description = e.target.value;
      setMarkers(copyMarkers);
    }
  }
  //373737
  return (
    <>
      {selected && (
        <>
          <Polygon
            positions={selected.boundingBox}
            pathOptions={{
              color: "#787276",
              fillColor: "#848482",
              weight: 2,
            }}
          />
          {selected.type === CursorModes.poly && (
            <>
              <Circle
                center={selected.rotationPoint}
                radius={60}
                pathOptions={handlerOptions}
              />
              {selected.positions.map((p, i) => (
                <Circle
                  center={p}
                  key={i}
                  radius={60}
                  pathOptions={handlerOptions}
                />
              ))}
              {[...selected.boundingBox, ...selected.bBoxMiddlePoints].map(
                (p, i) => (
                  <Circle
                    center={p}
                    key={i}
                    radius={60}
                    pathOptions={handlerOptions}
                  />
                )
              )}
            </>
          )}
        </>
      )}
      {markers.map((mapElement, index) => {
        if (mapElement.type == CursorModes.marker) {
          return (
            <Marker position={[mapElement.lat, mapElement.long]} key={index}>
              <Popup>
                <input
                  type="text"
                  value={mapElement.description}
                  onChange={(e) =>
                    markerInputHandler({ e, markerId: mapElement.id })
                  }
                />
              </Popup>
            </Marker>
          );
        } else if (mapElement.type == CursorModes.circle) {
          return (
            <Circle
              center={[mapElement.lat, mapElement.long]}
              radius={mapElement.radius}
              key={index}
            />
          );
        } else if (mapElement.type == CursorModes.poly) {
          if (mapElement.subtype == PolyTypes.polyline) {
            return <Polyline positions={mapElement.positions} key={index} />;
          } else {
            return <Polygon positions={mapElement.positions} key={index} />;
          }
        } else {
          return null;
        }
      })}
    </>
  );
}

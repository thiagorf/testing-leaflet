import {
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  Circle,
  Polygon,
  Rectangle,
} from "react-leaflet";
import "./App.css";
import { ChangeEvent, useState } from "react";
import { nanoid } from "nanoid";
import { distanceBetweenCoordinates } from "./helpers/haversine";
import { boundingBox } from "./helpers/bounding-box";

export enum CursorModes {
  none = "none",
  marker = "marker",
  circle = "circle",
  poly = "poly",
  selection = "selection",
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
  type: "poly";
  subtype: PolyTypes;
  positions: [number, number][];
}

interface MarkerInfo extends ElementsBaseData {
  type: "marker";
  description: string;
}

interface CircleInfo extends ElementsBaseData {
  type: "circle";
  radius: number;
}

type MapElements = MarkerInfo | CircleInfo | PolyInfo;

type SelectedElement = MapElements & {
  boundingBox: [number, number][];
  lastPosition: [number, number];
};

interface SourceTargetData {
  _latlngs: { lat: number; lng: number }[];
}

type CursorDispatch = React.Dispatch<React.SetStateAction<CursorModes>>;

type CentroidNCoordinates = [number, number][];

function getCentroid(coordinates: CentroidNCoordinates) {
  const polygonLength = coordinates.length;
  const sumOfLat = coordinates.reduce((arr, value) => (arr += value[0]), 0);
  const sumOfLong = coordinates.reduce((arr, value) => (arr += value[1]), 0);

  const centroid = [sumOfLat / polygonLength, sumOfLong / polygonLength];

  return centroid;
}

type BearingAngleCoodinates = {
  startPoint: number[];
  endPoint: number[];
};

function getBearing({ startPoint, endPoint }: BearingAngleCoodinates) {
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

type DestinationCoordinates = {
  startPoint: number[];
  bearing: number;
  distance: number;
};

function getDestination({
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

  function resetPolyData() {
    setLastSelectedId("");
    setPolyStatus("creating");
    setPolyCoordinates(null);
    props.setMode(CursorModes.none);
  }

  const map = useMapEvents({
    mousedown(e) {
      const { lat, lng } = e.latlng;
      if (props.cursorMode == "circle") {
        setMarkers((prev) => {
          const id = nanoid();
          setLastSelectedId(id);
          return [
            ...prev,
            {
              id,
              type: "circle",
              lat: lat,
              long: lng,
              radius: 0,
            },
          ];
        });
      }

      if (props.cursorMode == "poly") {
        if (polyCoordinates) {
          const elementsCopy = [...markers];
          const selectedElementIndex = elementsCopy.findIndex(
            (m) => m.id === lastSelectedId
          );
          const element = elementsCopy[selectedElementIndex];
          if (element.type == "poly") {
            const lastElementIndex = element.positions.length - 1;
            const [lat1, long1] = element.positions[lastElementIndex - 1];
            const [firstPointLat, firstPointLong] = element.positions[0];
            const distanceForTheLastPoint = distanceBetweenCoordinates({
              lat,
              long: lng,
              lat1,
              long1,
            });

            const distanceFotTheFirstPoint = distanceBetweenCoordinates({
              lat,
              long: lng,
              lat1: firstPointLat,
              long1: firstPointLong,
            });

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
                type: "poly",
                subtype: PolyTypes.polyline,
                positions: actualPositions,
              },
            ];
          });
        }
      }
    },
    mousemove(e) {
      const { lat, lng: long } = e.latlng;
      if (props.cursorMode == "circle" && lastSelectedId) {
        const elementsCopy = [...markers];
        const selectedElementIndex = elementsCopy.findIndex(
          (m) => m.id === lastSelectedId
        );
        const element = elementsCopy[selectedElementIndex];
        // assert marker type
        if (element.type == "circle") {
          const { lat: lat1, long: long1 } = element;

          const d = distanceBetweenCoordinates({ lat, long, lat1, long1 });

          console.log("d", d);
          element.radius = d;
          setMarkers(elementsCopy);
        }
      }

      if (props.cursorMode == "poly" && lastSelectedId) {
        const elementsCopy = [...markers];
        const selectedElementIndex = elementsCopy.findIndex(
          (m) => m.id === lastSelectedId
        );
        const element = elementsCopy[selectedElementIndex];

        if (element.type == "poly") {
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
    mouseup(e) {
      //const { lat: x, lng: y } = e.latlng;
      if (props.cursorMode == "circle") {
        // d = √((x1 - x2)2+(y1 - y2)2)
        setLastSelectedId("");
        console.log("Mouse up event", e);
      }
    },
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("map click", lat, lng);
      if (props.cursorMode == "marker") {
        setMarkers((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: "marker",
            lat: lat,
            long: lng,
            description: "",
          },
        ]);
      }
    },
  });
  if (props.cursorMode !== "none") {
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
    if (selectedMarkerElement.type == "marker") {
      selectedMarkerElement.description = e.target.value;
      setMarkers(copyMarkers);
    }
  }

  return (
    <>
      {selected && (
        <Rectangle
          bounds={[selected.boundingBox[0], selected.boundingBox[3]]}
          pathOptions={{ color: "gray" }}
          eventHandlers={{
            mousedown(e) {
              console.log(e);
              props.setMode(CursorModes.selection);
            },
            mousemove(e) {
              if (props.cursorMode === CursorModes.selection) {
                const { lat, lng } = e.latlng;
                const { lastPosition } = selected;
                const offset = [lat - lastPosition[0], lng - lastPosition[1]];
                const selectedCopy = { ...selected };
                selectedCopy.boundingBox = selectedCopy.boundingBox.map(
                  (coordinates) => [
                    coordinates[0] + offset[0],
                    coordinates[1] + offset[1],
                  ]
                );
                selectedCopy.lastPosition = [lat, lng];

                const markersCopy = [...markers];
                const selectedIndex = markersCopy.findIndex(
                  (m) => m.id === selected.id
                );

                const element = markersCopy[selectedIndex];
                if (selectedCopy.type === "poly" && element.type === "poly") {
                  console.log("Element positions prev", element.positions);
                  element.positions = selectedCopy.positions.map(
                    (coordinates) => [
                      coordinates[0] + offset[0],
                      coordinates[1] + offset[1],
                    ]
                  );

                  selectedCopy.positions = element.positions;
                  console.log("Element position next", element.positions);
                }

                setSelected(selectedCopy);
                setMarkers(markersCopy);
              }
            },
            mouseup() {
              props.setMode(CursorModes.none);
            },
          }}
        />
      )}
      {markers.map((mapElement, index) => {
        if (mapElement.type == "marker") {
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
        } else if (mapElement.type == "circle") {
          return (
            <Circle
              center={[mapElement.lat, mapElement.long]}
              radius={mapElement.radius}
              key={index}
            />
          );
        } else if (mapElement.type == "poly") {
          if (mapElement.subtype == PolyTypes.polyline) {
            return (
              <Polyline
                positions={mapElement.positions}
                eventHandlers={{
                  click(e) {
                    if (props.cursorMode === "none") {
                      const a = e.sourceTarget as SourceTargetData;
                      console.log(a._latlngs);
                      console.log(e);
                    }
                  },
                }}
                key={index}
              />
            );
          } else {
            return (
              <Polygon
                positions={mapElement.positions}
                eventHandlers={{
                  click(e) {
                    if (props.cursorMode === "none") {
                      const { lat, lng } = e.latlng;
                      const bBox = boundingBox({
                        positions: mapElement.positions,
                      });
                      setSelected({
                        ...mapElement,
                        boundingBox: bBox,
                        lastPosition: [lat, lng],
                      });
                    }
                  },
                  drag(e) {
                    console.log(e);
                  },
                }}
                key={index}
              />
            );
          }
        } else {
          return null;
        }
      })}
    </>
  );
}

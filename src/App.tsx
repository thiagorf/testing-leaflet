import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  Circle,
  Polygon,
} from "react-leaflet";
import "./App.css";
import { useState } from "react";
import { nanoid } from "nanoid";

enum CursorModes {
  none = "none",
  marker = "marker",
  circle = "circle",
  poly = "poly",
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

interface PolyInfo {
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

interface HaversineParams {
  lat: number;
  long: number;
  lat1: number;
  long1: number;
}

const R = 6371;

function rad(n: number) {
  return (n * Math.PI) / 180;
}

function distanceBetweenCoordinates({
  lat,
  long,
  lat1,
  long1,
}: HaversineParams): number {
  const x1 = lat1 - lat;
  const distanceLat = rad(x1);
  const x2 = long1 - long;
  const distanceLong = rad(x2);

  //  haversine formula
  const a =
    Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
    Math.cos(rad(lat)) *
      Math.cos(rad(lat1)) *
      Math.sin(distanceLong / 2) *
      Math.sin(distanceLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // * 1000 -> to kilometers
  const d = R * c * 1000;
  return d;
}

type CursorDispatch = React.Dispatch<React.SetStateAction<CursorModes>>;

function LocationMarker(props: {
  cursorMode: CursorModes;
  setMode: CursorDispatch;
}) {
  const [markers, setMarkers] = useState<MapElements[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string>();
  const [polyCoordinates, setPolyCoordinates] = useState<
    [number, number][] | null
  >(null);
  const [polyStatus, setPolyStatus] = useState<"selecting" | "creating">(
    "creating"
  );

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
              // check if the first point or the last one

              element.positions = element.positions.slice(0, lastElementIndex);
              setMarkers(elementsCopy);
              setLastSelectedId("");
              setPolyStatus("creating");
              setPolyCoordinates(null);
              props.setMode(CursorModes.none);
            } else if (
              distanceFotTheFirstPoint <= 65 &&
              element.positions.length >= 3
            ) {
              element.positions = element.positions.slice(0, lastElementIndex);
              element.subtype = PolyTypes.polygon;
              setMarkers(elementsCopy);
              setLastSelectedId("");
              setPolyStatus("creating");
              setPolyCoordinates(null);
              props.setMode(CursorModes.none);
              console.log(markers);
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
      if (props.cursorMode == "marker") {
        setMarkers((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: "marker",
            lat: lat,
            long: lng,
            description: "A marker?",
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

  return (
    <>
      {markers.map((mapElement, index) => {
        if (mapElement.type == "marker") {
          return (
            <Marker position={[mapElement.lat, mapElement.long]} key={index}>
              <Popup>{mapElement.description}</Popup>
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

function App() {
  const [mode, setMode] = useState<CursorModes>(CursorModes.none);

  return (
    <div>
      <div id="map-container">
        {" "}
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          scrollWheelZoom={false}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker cursorMode={mode} setMode={setMode} />
        </MapContainer>
      </div>
      <div>
        <span>mode: {mode}</span> <br />
        <span>is dragging on? {mode == "none" ? "true" : "false"}</span> <br />
        <button onClick={() => setMode(CursorModes.none)}>none</button>
        <button onClick={() => setMode(CursorModes.marker)}>marker</button>
        <button onClick={() => setMode(CursorModes.circle)}>circle</button>
        <button onClick={() => setMode(CursorModes.poly)}>
          polyline/polygon
        </button>
        {mode === "circle" && (
          <p>Press and hold to increase size (only on circle marker)</p>
        )}
        {mode === "poly" && (
          <p>
            Click, move and click (Polyline), click on the last created point to
            finish
          </p>
        )}
      </div>
    </div>
  );
}

export default App;

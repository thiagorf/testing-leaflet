import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet";
import "./App.css";
import { useState } from "react";
import { nanoid } from "nanoid";

enum CursorModes {
  none = "none",
  marker = "marker",
  circle = "circle",
}

interface MapCoordinates {
  lat: number;
  long: number;
}

interface ElementsBaseData extends MapCoordinates {
  id: string;
}

interface MarkerInfo extends ElementsBaseData {
  type: "marker";
  description: string;
}

interface CircleInfo extends ElementsBaseData {
  type: "circle";
  radius: number;
}

type MapElements = MarkerInfo | CircleInfo;

const R = 6371;

function rad(n: number) {
  return (n * Math.PI) / 180;
}

function LocationMarker(props: { cursorMode: CursorModes }) {
  const [markers, setMarkers] = useState<MapElements[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string>();

  const map = useMapEvents({
    mousedown(e) {
      const { lat, lng } = e.latlng;
      if (props.cursorMode == "circle") {
        console.log("Mouse down event", e);
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
    },
    mousemove(e) {
      const { lat, lng: long } = e.latlng;
      if (props.cursorMode == "circle" && lastSelectedId) {
        console.log("Mouse move event", e);
        const elementsCopy = [...markers];
        const selectedElementIndex = elementsCopy.findIndex(
          (m) => m.id === lastSelectedId
        );
        const { lat: lat1, long: long1 } = elementsCopy[selectedElementIndex];

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

        (elementsCopy[selectedElementIndex] as CircleInfo).radius = d;
        setMarkers(elementsCopy);

        console.log(d);
      }
    },
    mouseup(e) {
      const { lat: x, lng: y } = e.latlng;
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
      } else if (props.cursorMode == "circle") {
        // d = √((x1 - x2)2+(y1 - y2)2)
        /*
        console.log("Mouse click event", e);
        const { x, y } = e.layerPoint;
        const clickCoordinates = map.layerPointToLatLng([x, y]);
        console.log(clickCoordinates);

        setMarkers((prev) => [
          ...prev,
          {
            id: nanoid(),
            type: "circle",
            lat: lat,
            long: lng,
            radius: 0,
          },
        ]);
        */
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
      {markers.map(({ lat, long, ...mapElement }, index) => {
        if (mapElement.type == "marker") {
          return (
            <Marker position={[lat, long]} key={index}>
              <Popup>{mapElement.description}</Popup>
            </Marker>
          );
        } else if (mapElement.type == "circle") {
          return (
            <Circle
              center={[lat, long]}
              radius={mapElement.radius}
              key={index}
            />
          );
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
          <LocationMarker cursorMode={mode} />
        </MapContainer>
      </div>
      <div>
        <span>mode: {mode}</span> <br />
        <span>is dragging on? {mode == "none" ? "true" : "false"}</span> <br />
        <button onClick={() => setMode(CursorModes.none)}>none</button>
        <button onClick={() => setMode(CursorModes.marker)}>marker</button>
        <button onClick={() => setMode(CursorModes.circle)}>circle</button>
      </div>
    </div>
  );
}

export default App;

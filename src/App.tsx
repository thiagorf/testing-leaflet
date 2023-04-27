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

enum CursorModes {
  none = "none",
  marker = "marker",
  circle = "circle",
}

interface MapCoordinates {
  lat: number;
  long: number;
}

interface MarkerInfo extends MapCoordinates {
  type: "marker";
  description: string;
}

interface CircleInfo extends MapCoordinates {
  type: "circle";
  radius: number;
}

type MapElements = MarkerInfo | CircleInfo;

function LocationMarker(props: { cursorMode: CursorModes }) {
  const [markers, setMarkers] = useState<MapElements[]>([]);
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (props.cursorMode == "marker") {
        setMarkers((prev) => [
          ...prev,
          {
            type: "marker",
            lat: lat,
            long: lng,
            description: "A marker?",
          },
        ]);
      } else if (props.cursorMode == "circle") {
        setMarkers((prev) => [
          ...prev,
          {
            type: "circle",
            lat: lat,
            long: lng,
            radius: 100,
          },
        ]);
      }
    },
  });

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
          return <Circle center={[lat, long]} radius={mapElement.radius} />;
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
        <span>mode: {mode}</span>
        <button onClick={() => setMode(CursorModes.none)}>none</button>
        <button onClick={() => setMode(CursorModes.marker)}>marker</button>
        <button onClick={() => setMode(CursorModes.circle)}>circle</button>
      </div>
    </div>
  );
}

export default App;

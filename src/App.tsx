import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "./App.css";
import { useState } from "react";

enum CursorModes {
  none = "none",
  marker = "marker",
}

interface MarkerInfo {
  lat: number;
  long: number;
  description: string;
}

function LocationMarker(props: { cursorMode: CursorModes }) {
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const map = useMapEvents({
    click(e) {
      if (props.cursorMode == "marker") {
        const { lat, lng } = e.latlng;
        setMarkers((prev) => [
          ...prev,
          {
            lat: lat,
            long: lng,
            description: "A marker?",
          },
        ]);
      }
    },
  });

  return (
    <>
      {markers.map(({ lat, long, description }, index) => {
        return (
          <Marker position={[lat, long]} key={index}>
            <Popup>{description}</Popup>
          </Marker>
        );
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
      </div>
    </div>
  );
}

export default App;

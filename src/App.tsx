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

function LocationMarker() {
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const map = useMapEvents({
    click(e) {
      console.log(e);
      const { lat, lng } = e.latlng;
      setMarkers((prev) => [
        ...prev,
        {
          lat: lat,
          long: lng,
          description: "A marker?",
        },
      ]);

      //map.locate();
    },
  });

  return (
    <div>
      {markers.map(({ lat, long, description }) => {
        return (
          <Marker position={[lat, long]}>
            <Popup>{description}</Popup>
          </Marker>
        );
      })}
    </div>
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
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
          <LocationMarker />
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

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { CursorModes, MapElementsControll } from "./MapElementsControll";

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
          <MapElementsControll cursorMode={mode} setMode={setMode} />
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
          <div>
            <p>
              Click, move and click (Polyline), click on the last created point
              to finish
            </p>
            <p>
              Click, mode and click (minimum 3 points), click on the first point
              to finish(Polygon)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

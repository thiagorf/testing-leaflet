# Map

Testing Leafly features with OpenStreetMap for a future project

`npm install` <- install everything

`npm run dev` <- just do it

## Features

### Markers

![Placing markers on click in the map](https://github.com/thiagorf/testing-leaflet/blob/images/docs/marker.gif)

### Circle

![Placing a circle on the map and adjusting its size by moving the cursor](https://github.com/thiagorf/testing-leaflet/blob/images/docs/circle.gif)

### Polyline and Polygon

![Placing multiple line segments and creating a polygon if the segments connect itself](https://github.com/thiagorf/testing-leaflet/blob/images/docs/poly.gif)

## Keypoints

The rendering process is quite similar to HTML canvas,
elements are stored in an object and rendered through a loop,
and each object has different characteristics based on the element type,
so a strict check is necessary for the creation and rendering process

I think it's ok for now to bloat the App.tsx file with all code, even with that all unnecessary rerender

Increase circle marker radius based on mousedown event?

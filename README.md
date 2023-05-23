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

> Point precision of 65 kilometers

### Polygon resize and bounding box

![Move and resize polygon with handlers](https://github.com/thiagorf/testing-leaflet/blob/images/docs/resize.gif)

### Polygon and Polyline rotation

![Rotate polygon and polylines with handlers](https://github.com/thiagorf/testing-leaflet/blob/images/docs/rotation.gif)

## Keypoints

The rendering process is quite similar to HTML canvas,
elements are stored in an object and rendered through a loop,
and each object has different characteristics based on the element type,
so a strict check is necessary for the creation and rendering process

Haversine formula is used to measure the distance between two coordinates(latitude and longitude)

I think it's ok for now to bloat the App.tsx file with all code, even with that all unnecessary rerender

## Possible featues

- Polyline/Polygon resize handlers

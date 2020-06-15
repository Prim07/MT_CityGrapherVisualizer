import CircleStyle from 'ol/style/Circle';
import { Style, Stroke, Fill, RegularShape } from 'ol/style.js';

export function getLineStyle(rgb) {
  return new Style({
    stroke: new Stroke({
      width: 3,
      color: [Number(rgb["R"]), Number(rgb["G"]), Number(rgb["B"]), 1.0]
    })
  });
}

export function getDefaultCrossingMarkerStyle() {
  return new Style({
    image: new CircleStyle({
      radius: 1,
      fill: new Fill({ color: [0, 0, 0, 0.7] })
    })
  });
}

export function getCrossingMarkerStyle(rgb) {
  return new Style({
    image: new CircleStyle({
      radius: 4,
      fill: new Fill({ color: [Number(rgb["R"]), Number(rgb["G"]), Number(rgb["B"]), 0.5] })
    })
  });
} 

export function getHospitalMarkerStyle(rgb) {
  return new Style({
    image: new RegularShape({
      fill: new Fill({ color: [Number(rgb["R"]), Number(rgb["G"]), Number(rgb["B"]), 1.0] }),
      stroke: new Stroke({
        width: 2,
        color: [0, 0, 237, 0.7]
      }),
      points: 4,
      radius: 7,
      angle: Math.PI / 4
    })
  })
}

export function getDrawnPolygonStyle() {
  return new Style({
    stroke: new Stroke({
      width: 4,
      color: [33, 150, 243, 1.0],
      lineCap: "round"
    }),
    fill: new Fill({ color: [255, 255, 255, 0.5] })
  });
}
import CircleStyle from 'ol/style/Circle';
import { Style, Fill, Stroke } from 'ol/style.js';

export function getStyles() {
  return {
    'line': new Style({
      stroke: new Stroke({
        width: 3,
        color: [237, 0, 0, 0.5]
      })
    }),
    
    'marker': new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({ color: [237, 0, 0, 0.5] })
      })
    })
  };
}

export function getCrossingMarkerStyle() {
  return new Style({
    image: new CircleStyle({
      radius: 4,
      fill: new Fill({ color: [168, 48, 216, 0.5] })
    })
  });
} 

export function getHospitalMarkerStyle() {
  return new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: [0, 0, 237, 0.7] })
    })
  });
}

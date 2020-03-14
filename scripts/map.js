import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { getStyles } from './styles.js';

window.onresize = resizeOsmMapToItsContainersHeight;

export function drawMap(features, mapCenterCoords) {
  clearTarget();

  const styles = getStyles();
  
  const vectorSource = new VectorSource({ features: features });
  
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: function (feature) {
      return styles[feature.get('type')];
    }
  });
  
  const map = new Map({
    target: 'osmMap',
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer
    ],
    view: new View({
      projection: 'EPSG:3857',
      center: fromLonLat(mapCenterCoords),
      zoom: 13
    })
  });
}

function resizeOsmMapToItsContainersHeight() {
  const osmMapElement = document.getElementById("osmMap");
  osmMapElement.style.height = "0px";
  const height = document.getElementById("osmFirstMapContainer").offsetHeight + "px";
  osmMapElement.style.height = height;
};

function clearTarget() {
  document.getElementById("osmMap").innerHTML = "";
}

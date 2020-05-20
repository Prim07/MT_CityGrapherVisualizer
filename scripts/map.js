import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw';

window.onresize = resizeOsmMapToItsContainersHeight;

const map = new Map();
const vectorSource = new VectorSource({ wrapX: false });

var featuresToDraw = [];
var polygonFeatures = []

var draw; // global so we can remove it later
export function addInteraction(map) {
  draw = new Draw({
    source: vectorSource,
    type: "Polygon"
  });

  draw.on("drawend", (arg1) => {
    polygonFeatures = [arg1.feature];
  });

  draw.on("drawstart", () => {
    vectorSource.clear();
    vectorSource.addFeatures(featuresToDraw);
  });
  
  map.addInteraction(draw);
}

export function initializeMap() {
  map.setTarget('osmMap');
  
  map.addLayer(new TileLayer({
    source: new OSM()
  }));
  
  map.addLayer(new VectorLayer({
    source: vectorSource
  }));
  
  map.setView(new View({
    projection: 'EPSG:3857',
    center: fromLonLat([20.4122665, 49.8568619]),
    zoom: 2
  }));
  
  addInteraction(map);
}

export function addInteractionOnMap() {
  addInteraction(map);
}

export function updateMapView(features, mapCenterCoords) {
  map.getView().setCenter(fromLonLat(mapCenterCoords));
  map.getView().setZoom(13);
  vectorSource.clear();
  featuresToDraw = features;
  vectorSource.addFeatures(features.concat(polygonFeatures));
}

export function hideOsmMap() {
  document.getElementById("osmMap").style.display = "none";
}

export function showOsmMap() {
  document.getElementById("osmMap").style.display = "block";  
}

function resizeOsmMapToItsContainersHeight() {
  const osmMapElement = document.getElementById("osmMap");
  osmMapElement.style.height = "0px";
  const height = document.getElementById("osmFirstMapContainer").offsetHeight + "px";
  osmMapElement.style.height = height;
};

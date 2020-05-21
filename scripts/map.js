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

var graphNodesToDraw = [];
var lineFeaturesToDraw = [];
var polygonFeatures = [];
var draw; // global so we can remove it later

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
}

export function addInteractionOnMap() {
  addInteraction(map);
}

export function updateMapView(graphNodes, lineFeatures, mapCenterCoords) {
  map.getView().setCenter(fromLonLat(mapCenterCoords));
  map.getView().setZoom(13);
  vectorSource.clear();
  graphNodesToDraw = graphNodes;
  lineFeaturesToDraw = lineFeatures;
  vectorSource.addFeatures(getFeaturesFromGraphNodes(graphNodes).concat(lineFeatures).concat(polygonFeatures));
}

export function getPrioritizedGraphNodes() {
  let prioritizedGraphNodes = [];
  const polygonFeature = polygonFeatures[0];

  for (var graphNode of graphNodesToDraw) {
    if (isGraphNodePrioritized(polygonFeature, graphNode)) {
      prioritizedGraphNodes.push(graphNode);
    }
  }

  return prioritizedGraphNodes;
}

function isGraphNodePrioritized(polygonFeature, graphNode) {
  return polygonFeature.getGeometry().intersectsCoordinate(graphNode.feature.getGeometry().getCoordinates());
}

export function hideOsmMap() {
  document.getElementById("osmMap").style.display = "none";
}

export function showOsmMap() {
  document.getElementById("osmMap").style.display = "block";  
}

function addInteraction(map) {
  draw = new Draw({
    source: vectorSource,
    type: "Polygon"
  });

  draw.on("drawend", (arg1) => {
    polygonFeatures = [arg1.feature];
    getPrioritizedGraphNodes();
  });

  draw.on("drawstart", () => {
    vectorSource.clear();
    vectorSource.addFeatures(getFeaturesFromGraphNodes(graphNodesToDraw).concat(lineFeaturesToDraw));
  });

  map.addInteraction(draw);
}

function resizeOsmMapToItsContainersHeight() {
  const osmMapElement = document.getElementById("osmMap");
  osmMapElement.style.height = "0px";
  const height = document.getElementById("osmFirstMapContainer").offsetHeight + "px";
  osmMapElement.style.height = height;
}

function getFeaturesFromGraphNodes(givenGraphNodes) {
  let features = [];
  for (var graphNode of givenGraphNodes) {
    features.push(graphNode.feature);
  }
  return features;
}

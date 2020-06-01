import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import Draw from 'ol/interaction/Draw';
import { generateVoronoiDiagram } from './voronoi.js';
import { getDrawnPolygonStyle } from './styles.js';

window.onresize = resizeOsmMapToItsContainersHeight;

const inputVoronoiTriangulation = document.getElementById("inputVoronoiTriangulation");

const maxNumberOfPolygons = 5;
const map = new Map();
const vectorSource = new VectorSource({ wrapX: false });

var isDrawEnded = false;

var graphNodesToDraw = [];
var lineFeaturesToDraw = [];
var voronoiFeaturesToDraw = [];
var polygonFeaturesToDraw = [];
var draw;

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
  
  addInteractionOnMap();
}

export function addInteractionOnMap() {
  addInteraction(map);
}

export function updateMapView(graphNodes, lineFeatures, mapCenterCoords) {
  map.getView().setCenter(fromLonLat(mapCenterCoords));
  map.getView().setZoom(13);
  graphNodesToDraw = getGraphNodesWithoutDuplicates(graphNodes);
  lineFeaturesToDraw = lineFeatures;
  if (isVoronoiDiagramEnabled()) {
    voronoiFeaturesToDraw = generateVoronoiDiagram(graphNodesToDraw);
  };

  redrawFeatures();
}

export function getPrioritizedGraphNodes() {
  let prioritizedGraphNodes = [];
  
  for (var polygonFeatureIndex in polygonFeaturesToDraw) {
    let polygonFeature = polygonFeaturesToDraw[polygonFeatureIndex];
    let priorityValue = parseInt(document.getElementById("polygonPriorityInputNr" + (parseInt(polygonFeatureIndex) + 1)).value);
    for (var graphNode of graphNodesToDraw) {
      if (isGraphNodePrioritized(polygonFeature, graphNode) && graphNode.node['isCrossing'] == true) {
        if (graphNode.weight > 1) {
          graphNode.weight += priorityValue;
        } else {
          graphNode.weight = priorityValue;
        }
      }
    }
  }

  for(let graphNode of graphNodesToDraw) {
    let graphNodeWeight = graphNode.weight;
    let foundPriorityToIds = getPriorityValue(graphNodeWeight, prioritizedGraphNodes);

    if(foundPriorityToIds != null) {
      foundPriorityToIds['geographicalNodeDTOIds'].push(graphNode.node['id']);
    } else {
      let priorityValue = graphNode.weight;
      let geographicalNodeDTOIds = [graphNode.node['id']];
      prioritizedGraphNodes.push({ priorityValue, geographicalNodeDTOIds });
    }
  }

  return prioritizedGraphNodes;
}

export function removePolygonFeature() {
  if (polygonFeaturesToDraw.length > 0) {
    polygonFeaturesToDraw.pop();
    
    redrawFeatures();
    
    if (polygonFeaturesToDraw.length < maxNumberOfPolygons) {
      addInteractionOnMap();
    }
  }
  
  refreshPriorityInputsOnView();
}

export function hideOsmMap() {
  document.getElementById("osmMap").style.display = "none";
}

export function showOsmMap() {
  document.getElementById("osmMap").style.display = "block";
}

export function clearVoronoiDiagram() {
  voronoiFeaturesToDraw = [];
}

function redrawFeatures() {
  vectorSource.clear();
  vectorSource.addFeatures(getFeaturesFromGraphNodes(graphNodesToDraw).concat(lineFeaturesToDraw).concat(polygonFeaturesToDraw).concat(voronoiFeaturesToDraw))
}

function isVoronoiDiagramEnabled() {
  return inputVoronoiTriangulation.checked;
}

function isGraphNodePrioritized(polygonFeature, graphNode) {
  return polygonFeature.getGeometry().intersectsCoordinate(graphNode.feature.getGeometry().getCoordinates());
}

function getGraphNodesWithoutDuplicates(graphNodes) {
  const graphNodesWithoutDuplicates = [];
  const graphNodesIdsWithoutDuplicates = [];

  graphNodes.forEach(graphNode => {
    const id = graphNode.node['id'];
    if (!graphNodesIdsWithoutDuplicates.includes(id)) {
      graphNodesIdsWithoutDuplicates.push(id);
      graphNodesWithoutDuplicates.push(graphNode);
    }
  });

  return graphNodesWithoutDuplicates;
}

function getPriorityValue(weight, prioritizedGraphNodes) {
  let foundPriorityToIds = null;

  prioritizedGraphNodes.forEach(priorityToIds => {
    if (weight == priorityToIds['priorityValue']) {
      foundPriorityToIds = priorityToIds;
    }
  });

  return foundPriorityToIds;
}

function refreshPriorityInputsOnView() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById("polygonPriorityInputNr" + i).style.visibility = "collapse";
    document.getElementById("polygonPriorityPlaceholderNr" + i).style.visibility = "collapse";
  }

  for (let i in polygonFeaturesToDraw) {
    let num = parseInt(i) + 1;
    document.getElementById("polygonPriorityInputNr" + num).style.visibility = "visible";
    document.getElementById("polygonPriorityPlaceholderNr" + num).style.visibility = "visible";
  }
}

function addInteraction(map) {
  draw = new Draw({
    source: vectorSource,
    type: "Polygon"
  });
  
  draw.on("drawend", (arg1) => {
    map.removeInteraction(draw);
    arg1.feature.setStyle(getDrawnPolygonStyle());
    if (!isDrawEnded) {
      polygonFeaturesToDraw.push(arg1.feature);
      if (polygonFeaturesToDraw.length < maxNumberOfPolygons) {
        map.addInteraction(draw);
      }
      refreshPriorityInputsOnView();
      isDrawEnded = true;
    }
  });
  
  draw.on("drawstart", () => {
    isDrawEnded = false;
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

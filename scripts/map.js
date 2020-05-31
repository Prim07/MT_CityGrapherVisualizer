import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { getArea } from 'ol/sphere';
import Draw from 'ol/interaction/Draw';
import * as d3 from 'd3';
import * as ol_geom from 'ol/geom';
import { getMaxNodeWeighthValue } from './formValidator.js';
import { max } from 'd3';
import { GraphNode } from './GraphNode.js';

window.onresize = resizeOsmMapToItsContainersHeight;

const maxNumberOfPolygons = 5;
const map = new Map();
const vectorSource = new VectorSource({ wrapX: false });

var isDrawEnded = false;

var graphNodesToDraw = [];
var lineFeaturesToDraw = [];
var voronoiFeaturesToDraw = [];
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
  
  addInteractionOnMap();
}

export function addInteractionOnMap() {
  addInteraction(map);
}

export function updateMapView(graphNodes, lineFeatures, mapCenterCoords) {
  map.getView().setCenter(fromLonLat(mapCenterCoords));
  map.getView().setZoom(13);
  vectorSource.clear();
  graphNodesToDraw = getGraphNodesWithoutDuplicates(graphNodes);
  lineFeaturesToDraw = lineFeatures;
  drawVoronoiDiagram();
  vectorSource.addFeatures(getFeaturesFromGraphNodes(graphNodes).concat(lineFeatures).concat(polygonFeatures).concat(voronoiFeaturesToDraw));
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

export function getPrioritizedGraphNodes() {
  let prioritizedGraphNodes = [];
  
  for (var polygonFeatureIndex in polygonFeatures) {
    let polygonFeature = polygonFeatures[polygonFeatureIndex];
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

function getPriorityValue(weight, prioritizedGraphNodes) {
  let foundPriorityToIds = null;

  prioritizedGraphNodes.forEach(priorityToIds => {
    if (weight == priorityToIds['priorityValue']) {
      foundPriorityToIds = priorityToIds;
    }
  });

  return foundPriorityToIds;
}

function isGraphNodePrioritized(polygonFeature, graphNode) {
  return polygonFeature.getGeometry().intersectsCoordinate(graphNode.feature.getGeometry().getCoordinates());
}

export function removePolygonFeature() {
  console.log(polygonFeatures.length);
  if (polygonFeatures.length > 0) {
    polygonFeatures.pop();
    
    vectorSource.clear();
    vectorSource.addFeatures(getFeaturesFromGraphNodes(graphNodesToDraw).concat(lineFeaturesToDraw).concat(polygonFeatures));
    
    if (polygonFeatures.length < maxNumberOfPolygons) {
      addInteractionOnMap();
    }
  }
  
  refreshPriorityInputsOnView();
}

function refreshPriorityInputsOnView() {
  for (let i = 1; i <= 5; i++) {
    document.getElementById("polygonPriorityInputNr" + i).style.visibility = "collapse";
    document.getElementById("polygonPriorityPlaceholderNr" + i).style.visibility = "collapse";
  }
  
  for (let i in polygonFeatures) {
    let num = parseInt(i) + 1;
    document.getElementById("polygonPriorityInputNr" + num).style.visibility = "visible";
    document.getElementById("polygonPriorityPlaceholderNr" + num).style.visibility = "visible";
  }
  
}

export function hideOsmMap() {
  document.getElementById("osmMap").style.display = "none";
}

export function showOsmMap() {
  document.getElementById("osmMap").style.display = "block";
}

function drawVoronoiDiagram() {
  const graphNodesCoords = graphNodesToDraw.filter(g => g.node['isCrossing'] == true).map(g => [g.node['lon'], g.node['lat']]);
  const extentValues = getExtentValues(graphNodesCoords);
  const voronoi = d3.voronoi().extent(extentValues);
  const voronoiPolygons = voronoi.polygons(graphNodesCoords).filter(arr => arr != null).map(arr => arr.filter(el => el != null));
  
  voronoiFeaturesToDraw = [];
  
  const extentPoints = [
    [extentValues[0][0], extentValues[0][1]],
    [extentValues[0][0], extentValues[1][1]],
    [extentValues[1][0], extentValues[1][1]],
    [extentValues[1][0], extentValues[0][1]]
  ];
  
  const polygonToAreaToIsOnEdge = [];
  
  for (let voronoiPolygon of voronoiPolygons) {
    let voronoiPolygonCoords = [];
    
    for (let currentVoronoiPolygonCoords of voronoiPolygon) {
      voronoiPolygonCoords.push(currentVoronoiPolygonCoords);
    }
    
    voronoiPolygonCoords.push(voronoiPolygon[0]);
    
    let polygonFeature = new ol_geom.Polygon([voronoiPolygonCoords]).transform('EPSG:4326', map.getView().getProjection());
    
    voronoiFeaturesToDraw.push(new Feature({
      type: 'polygon',
      geometry: polygonFeature
    }));
    
    let squareMetersArea = getArea(polygonFeature);
    
    polygonToAreaToIsOnEdge.push([
      polygonFeature, squareMetersArea, !isNotPolygonOnTheEdgeOfTheCity(voronoiPolygonCoords, extentPoints)
    ]);
  }
  
  normalizeVoronoiWeights(polygonToAreaToIsOnEdge);
  
  updateGraphNodesWeights(polygonToAreaToIsOnEdge);
}

function isNotPolygonOnTheEdgeOfTheCity(voronoiPolygonCoords, extentPoints) {
  for (let i = 0; i < voronoiPolygonCoords.length - 1; ++i) {
    let currLineStartCoords = voronoiPolygonCoords[i];
    let currLineEndCoords = voronoiPolygonCoords[i + 1];
    
    let startX = currLineStartCoords[0];
    let startY = currLineStartCoords[1];
    let endX = currLineEndCoords[0];
    let endY = currLineEndCoords[1];
    
    for (let extentPoint of extentPoints) {
      let extentPointX = extentPoint[0];
      let extentPointY = extentPoint[1];
      
      if (areNumbersEqual(startX, extentPointX) && areNumbersEqual(endX, extentPointX)) {
        return false;
      }
      
      if (areNumbersEqual(startY, extentPointY) && areNumbersEqual(endY, extentPointY)) {
        return false;
      }
    }
  }
  
  return true;
}

function areNumbersEqual(val1, val2) {
  return Math.abs(val1 - val2) < 0.0000001;
}

function getExtentValues(coords) {
  let minLon = 180;
  let maxLon = -180;
  let minLat = 85.05112878;
  let maxLat = -85.05112878;
  
  for (let coord of coords) {
    let currentLon = coord[0];
    let currentLat = coord[1];
    
    if (currentLon > maxLon) {
      maxLon = currentLon;
    }
    
    if (currentLon < minLon) {
      minLon = currentLon;
    }
    
    if (currentLat > maxLat) {
      maxLat = currentLat;
    }
    
    if (currentLat < minLat) {
      minLat = currentLat;
    }
  }
  
  return [[minLon, minLat], [maxLon, maxLat]];
}

function normalizeVoronoiWeights(polygonToAreaToIsOnEdge) {
  weightDownAreasOnEdges(polygonToAreaToIsOnEdge);
  
  let maxArea = Number.NEGATIVE_INFINITY;
  let minArea = Number.POSITIVE_INFINITY;
  
  polygonToAreaToIsOnEdge.forEach(arr => {
    let currAreaValue = arr[1];
    if (currAreaValue > maxArea) {
      maxArea = currAreaValue;
    }
    if (currAreaValue < minArea) {
      minArea = currAreaValue;
    }
  });
  
  let minWeight = 1;
  let maxWeight = getMaxNodeWeighthValue();
  let chunk = (maxArea - minArea) / (maxWeight - minWeight);
  
  polygonToAreaToIsOnEdge.forEach(arr => {
    const currentArea = arr[1];
    arr[1] = Math.floor((currentArea - minArea) / chunk) + minWeight;
  }); 
}

function updateGraphNodesWeights(polygonToAreaToIsOnEdge) {
  for (let curentPolygonToAreaToIsOnEdge of polygonToAreaToIsOnEdge) {
    const currentPolygon = curentPolygonToAreaToIsOnEdge[0];
    for (let graphNode of graphNodesToDraw) {
      if (currentPolygon.intersectsCoordinate(graphNode.feature.getGeometry().getCoordinates())) {
        graphNode.weight = curentPolygonToAreaToIsOnEdge[1];
      }
    }
  }
}

function weightDownAreasOnEdges(polygonToAreaToIsOnEdge) {
  let sumOfAreasOnTheEdgeOfVoronoiDiagram = 0;
  let sumOfAreasNotOnTheEdgeOfVoronoiDiagram = 0;
  polygonToAreaToIsOnEdge.filter(arr => arr[2] == true).forEach(arr => sumOfAreasOnTheEdgeOfVoronoiDiagram += arr[1]);
  polygonToAreaToIsOnEdge.filter(arr => arr[2] == false).forEach(arr => sumOfAreasNotOnTheEdgeOfVoronoiDiagram += arr[1]);
  
  const avgOfAreasOnTheEdgeOfVoronoiDiagram = sumOfAreasOnTheEdgeOfVoronoiDiagram / polygonToAreaToIsOnEdge.filter(arr => arr[2] == true).length;
  const avgOfAreasNotOnTheEdgeOfVoronoiDiagram = sumOfAreasNotOnTheEdgeOfVoronoiDiagram / polygonToAreaToIsOnEdge.filter(arr => arr[2] == false).length;
  
  polygonToAreaToIsOnEdge.filter(arr => arr[2] == true).forEach(arr => {
    const currentArea = arr[1];
    arr[1] = avgOfAreasNotOnTheEdgeOfVoronoiDiagram - ((currentArea / avgOfAreasOnTheEdgeOfVoronoiDiagram));
  });
}

function addInteraction(map) {
  draw = new Draw({
    source: vectorSource,
    type: "Polygon"
  });
  
  draw.on("drawend", (arg1) => {
    if (!isDrawEnded) {
      polygonFeatures.push(arg1.feature);
      if (polygonFeatures.length >= maxNumberOfPolygons) {
        map.removeInteraction(draw);
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

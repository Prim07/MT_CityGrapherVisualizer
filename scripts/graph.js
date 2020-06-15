import { addMarker, addHospitalMarker, addCrossingMarker } from './marker.js';
import { addLine } from './line.js';
import { updateMapView } from './map.js';
import { getRgbColour } from './rgb.js';

export function drawGraph(graphData) {
    let shouldDrawAllNodes = sessionStorage.getItem('shouldDrawAllNodes');
    let shouldDrawAllCrossings = sessionStorage.getItem('shouldDrawAllCrossings');
    
    const edges = graphData['edges'];
    let features = [];
    let graphNodes = [];
    let mapCenterCoords;
    let addedCrossingsNodesIds = [];
    
    edges.forEach(edge => {
        const edgeCrossings = edge['nodes'];
        const firstCrossing = edgeCrossings[0];
        mapCenterCoords = [firstCrossing['lon'], firstCrossing['lat']];
        if (firstCrossing['isHospital']) {
            addHospitalMarker(graphNodes, firstCrossing, getRgbColour(firstCrossing));
            addedCrossingsNodesIds.push(firstCrossing['id']);
        } else {   
            if (shouldDrawAllCrossings == 'true' && firstCrossing['isCrossing'] == true) {
                if (!addedCrossingsNodesIds.includes(firstCrossing['id'])) {
                    addCrossingMarker(graphNodes, firstCrossing, getRgbColour(firstCrossing));
                    addedCrossingsNodesIds.push(firstCrossing['id']);
                }
            } else if (shouldDrawAllNodes == 'true') {
                addMarker(graphNodes, firstCrossing);
            }
        }
        
        for (let i = 1; i < edgeCrossings.length; ++i) {
            const crossingFrom = edgeCrossings[i - 1];
            const crossingFromCoords = [crossingFrom['lon'], crossingFrom['lat']];
            const crossingTo = edgeCrossings[i];
            const crossingToCoords = [crossingTo['lon'], crossingTo['lat']];
            addLine(features, crossingFromCoords, crossingToCoords, getRgbColour(edge));
            
            if (crossingTo['isHospital']) {
                addHospitalMarker(graphNodes, crossingTo, getRgbColour(crossingTo));
                addedCrossingsNodesIds.push(crossingTo['id']);
            } else { 
                if (shouldDrawAllCrossings == 'true' && crossingTo['isCrossing'] == true) {
                    if (!addedCrossingsNodesIds.includes(crossingTo['id'])) {
                        addCrossingMarker(graphNodes, crossingTo, getRgbColour(crossingTo));
                        addedCrossingsNodesIds.push(crossingTo['id']);
                    }
                } else if (shouldDrawAllNodes == 'true') {
                    addMarker(graphNodes, crossingTo); 
                }
            }
        }
    });
    
    updateMapView(graphNodes, features, mapCenterCoords);
}
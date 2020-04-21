import { addMarker, addHospitalMarker, addCrossingMarker } from './marker.js';
import { addLine } from './line.js';
import { updateMapView } from './map.js';

export function drawGraph(graphData) {
    // console.log(graphData);
    const shouldDrawAllNodes = sessionStorage.getItem('shouldDrawAllNodes');
    const shouldDrawAllCrossings = sessionStorage.getItem('shouldDrawAllCrossings');
    
    const edges = graphData['edges'];
    let features = [];
    let mapCenterCoords;
    
    edges.forEach(edge => {
        const edgeCrossings = edge['nodes'];
        
        const firstCrossing = edgeCrossings[0];
        const firstCrossingCoords = mapCenterCoords = [firstCrossing['lon'], firstCrossing['lat']];
        if (firstCrossing['isHospital']) {
            addHospitalMarker(features, firstCrossingCoords, getRgbColour(firstCrossing));
        } else {   
            if (shouldDrawAllCrossings == 'true' && firstCrossing['isCrossing'] == true) {
                addCrossingMarker(features, firstCrossingCoords, getRgbColour(firstCrossing));
            } else if (shouldDrawAllNodes == 'true') {
                addMarker(features, firstCrossingCoords);
            }
        }  
        
        for (let i = 1; i < edgeCrossings.length; ++i) {
            const crossingFrom = edgeCrossings[i - 1];
            const crossingFromCoords = [crossingFrom['lon'], crossingFrom['lat']];
            const crossingTo = edgeCrossings[i];
            const crossingToCoords = [crossingTo['lon'], crossingTo['lat']];
            addLine(features, crossingFromCoords, crossingToCoords, getRgbColour(edge));
            
            if (crossingTo['isHospital']) {
                addHospitalMarker(features, crossingToCoords, getRgbColour(crossingTo));
            } else { 
                if (shouldDrawAllCrossings == 'true' && crossingTo['isCrossing'] == true) {
                    addCrossingMarker(features, crossingToCoords, getRgbColour(crossingTo));
                } else if (shouldDrawAllNodes == 'true') {
                    addMarker(features, crossingToCoords); 
                }
            }        
        }
    });
    
    updateMapView(features, mapCenterCoords);
}

function getRgbColour(objWithColour) {
    return JSON.parse(objWithColour['colour']);
}

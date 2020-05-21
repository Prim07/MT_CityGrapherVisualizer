import { addMarker, addHospitalMarker, addCrossingMarker } from './marker.js';
import { addLine } from './line.js';
import { updateMapView } from './map.js';
import { getRgbColour } from './rgb.js';

export function drawGraph(graphData) {
    // console.log(graphData);
    const shouldDrawAllNodes = sessionStorage.getItem('shouldDrawAllNodes');
    const shouldDrawAllCrossings = sessionStorage.getItem('shouldDrawAllCrossings');
    
    const edges = graphData['edges'];
    let features = [];
    let graphNodes = [];
    let mapCenterCoords;
    
    edges.forEach(edge => {
        const edgeCrossings = edge['nodes'];
        
        const firstCrossing = edgeCrossings[0];
        mapCenterCoords = [firstCrossing['lon'], firstCrossing['lat']];
        if (firstCrossing['isHospital']) {
            addHospitalMarker(graphNodes, firstCrossing, getRgbColour(firstCrossing));
        } else {   
            if (shouldDrawAllCrossings == 'true' && firstCrossing['isCrossing'] == true) {
                addCrossingMarker(graphNodes, firstCrossing, getRgbColour(firstCrossing));
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
            } else { 
                if (shouldDrawAllCrossings == 'true' && crossingTo['isCrossing'] == true) {
                    addCrossingMarker(graphNodes, crossingTo, getRgbColour(crossingTo));
                } else if (shouldDrawAllNodes == 'true') {
                    addMarker(graphNodes, crossingTo); 
                }
            }        
        }
    });
    
    updateMapView(graphNodes, features, mapCenterCoords);
}
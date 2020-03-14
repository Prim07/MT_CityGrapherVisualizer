import { addMarker, addHospitalMarker, addCrossingMarker } from './marker.js';
import { addLine } from './line.js';
import { drawMap } from './map.js';

export function drawGraph(graphData) {
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
            addHospitalMarker(features, firstCrossingCoords);
        } else {   
            if (shouldDrawAllCrossings == 'true' && firstCrossing['isCrossing'] == true) {
                addCrossingMarker(features, firstCrossingCoords);
            } else if (shouldDrawAllNodes == 'true') {
                addMarker(features, firstCrossingCoords);
            }
        }  
        
        for (let i = 1; i < edgeCrossings.length; ++i) {
            const crossingFrom = edgeCrossings[i - 1];
            const crossingFromCoords = [crossingFrom['lon'], crossingFrom['lat']];
            const crossingTo = edgeCrossings[i];
            const crossingToCoords = [crossingTo['lon'], crossingTo['lat']];
            addLine(features, crossingFromCoords, crossingToCoords);
            
            if (crossingTo['isHospital']) {
                addHospitalMarker(features, crossingToCoords);
            } else { 
                if (shouldDrawAllCrossings == 'true' && crossingTo['isCrossing'] == true) {
                    addCrossingMarker(features, crossingToCoords);
                } else if (shouldDrawAllNodes == 'true') {
                    addMarker(features, crossingToCoords); 
                }
            }        
        }
    });
    
    drawMap(features, mapCenterCoords);
}

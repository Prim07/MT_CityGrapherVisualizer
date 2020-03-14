import { Feature } from 'ol';
import { LineString } from 'ol/geom';

export function addLine(features, fromCoords, toCoords) {
	const locations = [fromCoords, toCoords];
	
	const line = new Feature({
		type: 'line',
		geometry: new LineString(locations).transform('EPSG:4326', 'EPSG:3857')
	});

	features.push(line);
} 

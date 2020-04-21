import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { getLineStyle } from './styles.js';

export function addLine(features, fromCoords, toCoords, rgb) {
	const locations = [fromCoords, toCoords];
	
	const line = new Feature({
		type: 'line',
		geometry: new LineString(locations).transform('EPSG:4326', 'EPSG:3857')
	});

	line.setStyle(getLineStyle(rgb));

	features.push(line);
} 

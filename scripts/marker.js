import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { getHospitalMarkerStyle, getCrossingMarkerStyle, getDefaultCrossingMarkerStyle } from './styles.js';

export function addMarker(features, coords) {
	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getDefaultCrossingMarkerStyle());

	features.push(marker);
}

export function addCrossingMarker(features, coords, rgb) {
	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getCrossingMarkerStyle(rgb));

	features.push(marker);
} 

export function addHospitalMarker(features, coords, rgb) {
	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getHospitalMarkerStyle(rgb));

	features.push(marker);
}

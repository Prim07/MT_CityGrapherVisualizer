import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { getHospitalMarkerStyle, getCrossingMarkerStyle, getDefaultCrossingMarkerStyle } from './styles.js';
import { GraphNode } from './GraphNode.js';
import { getRgbColour } from './rgb.js';

export function addMarker(graphNodes, node) {
	const coords = [node['lon'], node['lat']];

	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getDefaultCrossingMarkerStyle());

	graphNodes.push(new GraphNode(node, marker));
}

export function addCrossingMarker(graphNodes, node, rgb) {
	const coords = [node['lon'], node['lat']];

	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getCrossingMarkerStyle(getRgbColour(node)));

	graphNodes.push(new GraphNode(node, marker));
}

export function addHospitalMarker(graphNodes, node, rgb) {
	const coords = [node['lon'], node['lat']];

	const marker = new Feature({
		type: 'marker',
		geometry: new Point(coords).transform('EPSG:4326', 'EPSG:3857')
	});

	marker.setStyle(getHospitalMarkerStyle(getRgbColour(node)));

	graphNodes.push(new GraphNode(node, marker));
}
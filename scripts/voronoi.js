import { Feature } from 'ol';
import { getArea } from 'ol/sphere';
import * as d3 from 'd3';
import * as ol_geom from 'ol/geom';

export function generateVoronoiDiagram(graphNodesToDraw) {
    const graphNodesCoords = graphNodesToDraw.filter(g => g.node['isCrossing'] == true).map(g => [g.node['lon'], g.node['lat']]);
    const extentValues = getExtentValues(graphNodesCoords);
    const voronoi = d3.voronoi().extent(extentValues);
    const voronoiPolygons = voronoi.polygons(graphNodesCoords).filter(arr => arr != null).map(arr => arr.filter(el => el != null));

    let voronoiFeaturesToDraw = [];

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

        let polygonFeature = new ol_geom.Polygon([voronoiPolygonCoords]).transform('EPSG:4326', 'EPSG:3857');

        voronoiFeaturesToDraw.push(new Feature({
            type: 'polygon',
            geometry: polygonFeature
        }));

        let squareMetersArea = getArea(polygonFeature);

        polygonToAreaToIsOnEdge.push([
            polygonFeature, squareMetersArea, !isNotPolygonOnTheEdgeOfTheCity(voronoiPolygonCoords, extentPoints)
        ]);
    }

    setAreasOnEdgesToNegativeWeight(polygonToAreaToIsOnEdge);
    setAreasNotOnEdgesToPercentgeShare(polygonToAreaToIsOnEdge);

    updateGraphNodesWeights(polygonToAreaToIsOnEdge, graphNodesToDraw);

    return voronoiFeaturesToDraw;
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

function updateGraphNodesWeights(polygonToAreaToIsOnEdge, graphNodesToDraw) {
    for (let curentPolygonToAreaToIsOnEdge of polygonToAreaToIsOnEdge) {
        const currentPolygon = curentPolygonToAreaToIsOnEdge[0];
        for (let graphNode of graphNodesToDraw) {
            if (currentPolygon.intersectsCoordinate(graphNode.feature.getGeometry().getCoordinates())) {
                graphNode.voronoiWeight = curentPolygonToAreaToIsOnEdge[1];
            }
        }
    }

    graphNodesToDraw.filter(graphNode => isNodeOnCityEdgeline(graphNode)).forEach(graphNode => graphNode.voronoiWeight = -1);
}

function isNodeOnCityEdgeline(graphNode) {
    return graphNode.voronoiWeight == 0;
}

function setAreasOnEdgesToNegativeWeight(polygonToAreaToIsOnEdge) {
    polygonToAreaToIsOnEdge.filter(arr => arr[2] == true).forEach(arr => {
        arr[1] = -1;
    });
}

function setAreasNotOnEdgesToPercentgeShare(polygonToAreaToIsOnEdge) {
    let sumOfAreasNotOnTheEdgeOfVoronoiDiagram = 0;
    polygonToAreaToIsOnEdge.filter(arr => arr[2] == false).forEach(arr => sumOfAreasNotOnTheEdgeOfVoronoiDiagram += arr[1]);

    polygonToAreaToIsOnEdge.filter(arr => arr[2] == false).forEach(arr => {
        const currentArea = arr[1];
        arr[1] = currentArea / sumOfAreasNotOnTheEdgeOfVoronoiDiagram;
    });  
}
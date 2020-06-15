
class GraphNode {

    constructor(node, feature) {
        this._node = node;
        this._feature = feature;
        this._manualWeight = 1;
        this._voronoiWeight = -10;
    }

    get node() {
        return this._node;
    }

    get feature() {
        return this._feature;
    }

    get manualWeight() {
        return this._manualWeight;
    }

    set manualWeight(val) {
        this._manualWeight = val;
    }

    get voronoiWeight() {
        return this._voronoiWeight;
    }

    set voronoiWeight(val) {
        this._voronoiWeight = val;
    }

}

export { GraphNode };
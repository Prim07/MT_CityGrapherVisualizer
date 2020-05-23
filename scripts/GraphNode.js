
class GraphNode {

    constructor(node, feature) {
        this._node = node;
        this._feature = feature;
    }

    get node() {
        return this._node;
    }

    get feature() {
        return this._feature;
    }

}

export { GraphNode };
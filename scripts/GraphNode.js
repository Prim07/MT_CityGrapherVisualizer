
class GraphNode {

    constructor(node, feature) {
        this._node = node;
        this._feature = feature;
    }

    get feature() {
        return this._feature;
    }

}

export { GraphNode };
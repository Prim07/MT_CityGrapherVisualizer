
class GraphNode {

    constructor(node, feature) {
        this._node = node;
        this._feature = feature;
        this._weight = 1;
    }

    get node() {
        return this._node;
    }

    get feature() {
        return this._feature;
    }

    get weight() {
        return this._weight;
    }

    set weight(val) {
        this._weight = val;
    }

}

export { GraphNode };
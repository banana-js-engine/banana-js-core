import { Layer } from "../banana.js";
import { Log } from "./Log.ts";

export class LayerStack {

    layers: Layer[];
    lastLayerIndex: number;

    constructor() {
        this.layers = [];
        this.lastLayerIndex = 0;
    }

    pushLayer(layer: Layer) {
        this.layers.splice(this.lastLayerIndex, 0, layer);
        this.lastLayerIndex++;
    }

    pushOverlay(overlay: Layer) {
        this.layers.push(overlay);
    }

    popLayer(layer: Layer) {
        let index = this.layers.indexOf(layer);

        if (index == -1) {
            Log.Core_Error(`Layer '${layer.getDebugName()}' does not exist!`);
            return;
        }

        this.layers.splice(index, 1);
        this.lastLayerIndex--;
    }

    popOverlay(overlay: Layer) {
        let index = this.layers.indexOf(overlay);

        if (index == -1) {
            Log.Core_Error(`Overlay '${overlay.getDebugName()}' does not exist!`);
            return;
        }

        this.layers.splice(index, 1);
    }

    getLayers() {
        return this.layers;
    }
}
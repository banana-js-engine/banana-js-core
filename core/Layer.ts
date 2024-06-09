import { Event } from "../event/Event.js";

export class Layer {
    debugName: string

    constructor(name = 'Layer') {
        this.debugName = name;
    }

    onAttach() {}
    onDetach() {}
    onUpdate(deltaTime: number) {}
    onImGuiRender() {}
    onEvent(event: Event) {}

    getDebugName() {
        return this.debugName;
    }
}
export class Layer {
    debugName: string

    constructor(name = 'Layer') {
        this.debugName = name;
    }

    onAttach() {}
    onDetach() {}
    onUpdate(deltaTime) {}
    onGUIRender() {}
    onEvent(event) {}

    getDebugName() {
        return this.debugName;
    }
}
import * as banana from "../../dist/banana.js";

/**
 * Use this layer as a testing measure in your issues
 */
export class TestLayer extends banana.Layer {

    constructor() {
        super('Test Layer');
        
        this.scene = new banana.Scene('test scene');

        this.camera = this.scene.createEntity('camera');
        this.camera.addComponent(banana.ComponentType.CameraComponent);
        
        this.circle = this.scene.createEntity('circle');
        this.circle.addComponent(banana.ComponentType.CircleRendererComponent);
        
        this.square = this.scene.createEntity('square');
        this.square.addComponent(banana.ComponentType.SpriteRendererComponent);
        this.square.getComponent(banana.ComponentType.TransformComponent).translate(1.5, 0, 0);

        this.text = this.scene.createEntity('text');
        this.text.addComponent(banana.ComponentType.TextRendererComponent).setText('deniz!');
        this.text.getComponent(banana.ComponentType.TransformComponent).translate(0, 1.5, 0);
    }

    onUpdate(deltaTime) {
        this.scene.onUpdateRuntime(deltaTime);
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
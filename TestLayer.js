import * as banana from './banana.js';

class TextScript extends banana.ScriptableEntity {
    onUpdate(deltaTime) {
        if (banana.Input.isKeyPressed(banana.KeyCode.D) || banana.Input.isGamepadButtonPressed(banana.GamepadButtonCode.Dpad_Right)) {
            this.transform.translate(2, 0, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.A) || banana.Input.isGamepadButtonPressed(banana.GamepadButtonCode.Dpad_Left)) {
            this.transform.translate(-2, 0, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.S) || banana.Input.isGamepadButtonPressed(banana.GamepadButtonCode.Dpad_Down)) {
            this.transform.translate(0, 2, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.W) || banana.Input.isGamepadButtonPressed(banana.GamepadButtonCode.Dpad_Up)) {
            this.transform.translate(0, -2, 0);
        }
    }
}

export class TestLayer extends banana.Layer {
    constructor() {
        super('TestLayer');

        banana.Renderer2D.init();
        
        this.scene = new banana.Scene('NAME');
        
        this.camera = this.scene.createEntity('camera');
        this.camera.addComponent(banana.ComponentType.CameraComponent);

        this.circleA = this.scene.createEntity('circleA');
        const spriteA = this.circleA.addComponent(banana.ComponentType.SpriteRendererComponent);
        this.circleA.addComponent(banana.ComponentType.NativeScriptComponent).bind(TextScript);
        this.circleA.addComponent(banana.ComponentType.Body2DComponent);
        
        this.circleB = this.scene.createEntity('circleB');
        this.circleB.addComponent(banana.ComponentType.SpriteRendererComponent);
        this.circleB.addComponent(banana.ComponentType.Body2DComponent);
        this.circleBTransform = this.circleB.getComponent(banana.ComponentType.TransformComponent);
        this.circleBTransform.translate(150, 0, 0);

        banana.RenderCommand.setClearColor( new banana.Color(0, 0, 0, 0) );
    }

    onUpdate(deltaTime) {
        banana.RenderCommand.clear();
        this.scene.onUpdateRuntime(deltaTime);
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
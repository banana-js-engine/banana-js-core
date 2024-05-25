import * as banana from './banana.js';

class TestScript extends banana.ScriptableEntity {
    onCreate() {
        this.body = this.getComponent(banana.ComponentType.Body2DComponent);
    }

    onUpdate(deltaTime) {
        if (banana.Input.isKeyPressed(banana.KeyCode.D)) {
            //this.transform.translate(2, 0, 0);
            this.body.addForce(new banana.Vec2(60, 0));
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.A)) {
            //this.transform.translate(-2, 0, 0);
            this.body.addForce(new banana.Vec2(-60, 0));
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.S)) {
            //this.transform.translate(0, 2, 0);
            this.body.addForce(new banana.Vec2(0, 60));
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.W)) {
            //this.transform.translate(0, -2, 0);
            this.body.addForce(new banana.Vec2(0, -60));
        }
    }
}

class ObjectSpawner extends banana.ScriptableEntity {
    onUpdate(deltaTime) {
        if (banana.Input.isMouseButtonPressedOnce(banana.MouseButton.MOUSE_RIGHT)) { 
            this.instantiate(this.mainCamera.screenToViewportSpace( banana.Input.mousePosition ), true);
        }
        if (banana.Input.isMouseButtonPressedOnce(banana.MouseButton.MOUSE_LEFT)) {
            this.instantiate(this.mainCamera.screenToViewportSpace( banana.Input.mousePosition ));
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
        
        this.objectSpawner = this.scene.createEntity('object spawner');
        this.objectSpawner.addComponent(banana.ComponentType.NativeScriptComponent).bind(ObjectSpawner);

        this.ground = this.scene.createEntity('ground');
        const groundSprite = this.ground.addComponent(banana.ComponentType.SpriteRendererComponent);
        groundSprite.setColor(banana.Color.BLUE);
        const groundTransform = this.ground.getComponent(banana.ComponentType.TransformComponent);
        groundTransform.setScale(15, 2, 1);
        groundTransform.translate(0, 5, 0);
        const groundBody = this.ground.addComponent(banana.ComponentType.Body2DComponent);
        groundBody.body2d.isStatic = true;
        groundBody.body2d.inverseMass = 0;
        groundBody.body2d.inverseInertia = 0;

        this.static1 = this.scene.createEntity('static1');
        const static1Sprite = this.static1.addComponent(banana.ComponentType.SpriteRendererComponent);
        static1Sprite.setColor(banana.Color.GREEN);
        const static1Transform = this.static1.getComponent(banana.ComponentType.TransformComponent);
        static1Transform.setScale(5, 1, 1);
        static1Transform.translate(-5, -2, 0);
        static1Transform.rotate(0, 0, 30);
        const static1Body = this.static1.addComponent(banana.ComponentType.Body2DComponent);
        static1Body.body2d.isStatic = true;
        static1Body.body2d.inverseMass = 0;
        static1Body.body2d.inverseInertia = 0;

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
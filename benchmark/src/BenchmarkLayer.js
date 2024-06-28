import * as banana from "../../dist/banana.js";

/**
 * Benchmark layer which is used to test the limits of the engine by rendering 
 * and/or enabling the physics of many entities at once and measure performance  
 */
export class BenchmarkLayer extends banana.Layer {

    constructor() {
        super('Benchmark Layer');

        this.entityCountCurrent = 0;
        this.entityCountFormer = 0;
        this.currentCount = [0];
        this.entityList = [];
        this.clicked = 0;
        this.rendering = false;
        this.physics = false;
        this.fps = 1/60;

        this.scene = new banana.Scene('scene');

        this.camera = this.scene.createEntity('camera');
        this.camera.addComponent(banana.ComponentType.CameraComponent);
        
        banana.RenderCommand.setClearColor( banana.Color.BLACK );
    }

    onUpdate(deltaTime) {
        this.scene.onUpdateRuntime(deltaTime);
        this.fps = 1 / deltaTime;
    }

    onImGuiRender() {
        // ImGUI section
        {
            banana.ImGui.Begin('Benchmark Panel');
            banana.ImGui.Text(`FPS: ${Math.floor(this.fps)}`);

            banana.ImGui.InputInt("Entity Count", this.currentCount);
            if (banana.ImGui.Button("Create Entities")){
                this.clicked++;
            }
            banana.ImGui.Checkbox("Rendering enabled", (value = this.rendering) => this.rendering = value);
            banana.ImGui.Checkbox("Physics enabled", (value = this.physics) => this.physics = value);

            banana.ImGui.End();
        }
        
        if (this.clicked == 1) {
            this.clicked = 0;
            this.entityCountFormer = this.entityCountCurrent;
            this.entityCountCurrent = this.currentCount[0];
            for (let i = 0; i < this.entityCountFormer; i++) {
                this.scene.destroyEntity(this.entityList.pop());
            }

            for (let i = 0; i < this.entityCountCurrent; i++) {
                this.square = this.scene.createEntity('square');
                let xPos = Math.floor(Math.random() * (-8) + 4.5);
                let yPos = Math.floor(Math.random() * (-8) + 4.5);
                
                if (this.rendering) {
                    this.square.addComponent(banana.ComponentType.SpriteRendererComponent);
                }
                if (this.physics) {
                    this.square.addComponent(banana.ComponentType.Body2DComponent);
                }
                let transform = this.square.getComponent(banana.ComponentType.TransformComponent);
                transform.setPosition(xPos, yPos, 0);
                this.entityList.push(this.square);
            }
        }

    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
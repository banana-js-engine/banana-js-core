import * as banana from "../../build/banana.js";

/**
 * Benchmark layer which is used to test the limits of the engine by rendering 
 * and/or enabling the physics of many entities at once and   
 */
export class BenchmarkLayer extends banana.Layer {

    constructor() {
        super('Benchmark Layer');

        banana.Renderer2D.init();

        this.entityCountCurrent = 0;
        this.entityCountFormer = 0;
        this.currentCount = [0];
        this.entityList = [];
        this.clicked = 0;
        this.counter = 0;
        this.rendering = false;
        this.physics = false;
        this.clearColorIm = new banana.ImGui.Vec4(0.0, 0.0, 0.0, 1.0);

        this.scene = new banana.Scene('scene');

        this.camera = this.scene.createEntity('camera');
        this.camera.addComponent(banana.ComponentType.CameraComponent);
        
        banana.RenderCommand.setClearColor( banana.Color.BLACK );
    }

    onUpdate(deltaTime) {

        banana.RenderCommand.clear();
        
        this.scene.onUpdateRuntime(deltaTime);
        
        // ImGUI section
        banana.ImGui_Impl.NewFrame(deltaTime);
        banana.ImGui.NewFrame();
        
        {
            banana.ImGui.Begin('Benchmark Panel');
            banana.ImGui.Text(`FPS: ${Math.floor(1 / deltaTime)}`);

            banana.ImGui.InputInt("Entity Count", this.currentCount);
            if (banana.ImGui.Button("Create Entities")){
                this.clicked++;
            }
            banana.ImGui.Checkbox("Rendering enabled", (value = this.rendering) => this.rendering = value);
            banana.ImGui.Checkbox("Physics enabled", (value = this.physics) => this.physics = value);

            banana.ImGui.End();
        }
        
        banana.ImGui.EndFrame();
        
        banana.ImGui.Render();

        banana.ImGui_Impl.RenderDrawData(banana.ImGui.GetDrawData());

        banana.RenderCommand.setClearColor( new banana.Color( this.clearColorIm.x, this.clearColorIm.y, this.clearColorIm.z, this.clearColorIm.w ) );

        if (this.clicked == 1) {
            this.clicked = 0;
            this.entityCountFormer = this.entityCountCurrent;
            this.entityCountCurrent = this.currentCount[0];
            for (let i = 0; i < this.entityCountFormer; i++) {
                this.scene.destroyEntity(this.entityList.pop());
            }

            for (let i = 0; i < this.entityCountCurrent; i++) {
                this.square = this.scene.createEntity('square');
                if (this.rendering) {
                    this.square.addComponent(banana.ComponentType.SpriteRendererComponent);
                }
                if (this.physics) {
                    this.square.addComponent(banana.ComponentType.Body2DComponent);
                }
                this.entityList.push(this.square);
            }
        }
   
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
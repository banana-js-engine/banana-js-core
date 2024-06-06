import * as banana from "../../build/banana.js";
import { GamepadTestScript } from "./GamepadTestScript.js";

/**
 * Example layer which demonstrates a simple ImGUI Panel
 */
export class EditorLayer extends banana.Layer {

    constructor() {
        super('Editor Layer');

        this.counter = 0;
        this.darkMode = true;
        this.clearColorIm = new banana.ImGui.Vec4(0.0, 0.0, 0.0, 1.0);
        this.fps = 75;

        this.scene = new banana.Scene('scene');

        this.camera = this.scene.createEntity('camera');
        this.camera.addComponent(banana.ComponentType.CameraComponent);
        
        this.circle = this.scene.createEntity('circle');
        this.circle.addComponent(banana.ComponentType.CircleRendererComponent);
        
        this.square = this.scene.createEntity('square');
        this.square.addComponent(banana.ComponentType.SpriteRendererComponent).setColor(banana.Color.RED);
        this.square.getComponent(banana.ComponentType.TransformComponent).translate(1.5, 0, 0);

        this.gamepadTest = this.scene.createEntity('gamepad test');
        this.gamepadTest.addComponent( banana.ComponentType.NativeScriptComponent ).bind(GamepadTestScript);
    }

    onUpdate(deltaTime) {

        this.scene.onUpdateRuntime(deltaTime);

        this.fps = 1 / deltaTime;

        banana.RenderCommand.setClearColor( new banana.Color( this.clearColorIm.x, this.clearColorIm.y, this.clearColorIm.z, this.clearColorIm.w ) );

        if (this.darkMode) {
            banana.ImGui.StyleColorsDark();
        }
        else { 
            banana.ImGui.StyleColorsLight();
        }
    }

    onImGuiRender() {
        banana.ImGui.Begin('Test Panel');
        banana.ImGui.Text(`FPS: ${this.fps.toFixed(1)}`);
        
        banana.ImGui.ColorEdit4('Clear Color', this.clearColorIm);

        banana.ImGui.Checkbox("Dark Mode", (value = this.darkMode) => this.darkMode = value);

        banana.ImGui.End();
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
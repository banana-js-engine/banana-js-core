import * as banana from "../../build/banana.js";
import { GamepadTestScript } from "./GamepadTestScript.js";

/**
 * Example layer which demonstrates a simple ImGUI Panel
 */
export class EditorLayer extends banana.Layer {

    constructor() {
        super('Editor Layer');

        banana.Renderer2D.init();

        this.counter = 0;
        this.darkMode = true;
        this.clearColorIm = new banana.ImGui.Vec4(0.0, 0.0, 0.0, 1.0);

        this.scene = new banana.Scene('scene');

        this.gamepadTest = this.scene.createEntity('gamepad test');
        this.gamepadTest.addComponent( banana.ComponentType.NativeScriptComponent ).bind(GamepadTestScript);

        banana.RenderCommand.setClearColor( banana.Color.BLACK );
    }

    onUpdate(deltaTime) {

        banana.RenderCommand.clear();
        
        this.scene.onUpdateRuntime(deltaTime);
        
        // ImGUI section
        banana.ImGui_Impl.NewFrame(deltaTime);
        banana.ImGui.NewFrame();
        
        {
            banana.ImGui.Begin('Test Panel');
            banana.ImGui.Text(`FPS: ${Math.floor(1 / deltaTime)}`);
            
            banana.ImGui.ColorEdit4('Clear Color', this.clearColorIm);

            banana.ImGui.Checkbox("Dark Mode", (value = this.darkMode) => this.darkMode = value);

            banana.ImGui.End();
        }
        
        banana.ImGui.EndFrame();
        
        banana.ImGui.Render();

        banana.ImGui_Impl.RenderDrawData(banana.ImGui.GetDrawData());

        banana.RenderCommand.setClearColor( new banana.Color( this.clearColorIm.x, this.clearColorIm.y, this.clearColorIm.z, this.clearColorIm.w ) );

        if (this.darkMode) {
            banana.ImGui.StyleColorsDark();
        }
        else { 
            banana.ImGui.StyleColorsLight();
        }
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
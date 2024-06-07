import * as banana from "../../build/banana.js";
import { SceneHierarchyPanel } from "./panels/SceneHierarchyPanel.js";

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

        
        this.scene = new banana.Scene('game scene');

        this.sceneHierarchyPanel = new SceneHierarchyPanel(this.scene);
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

        if (banana.ImGui.Button('Save')) {
            banana.SceneSerializer.save(this.scene);
        }

        if (banana.ImGui.Button('Load')) {
            banana.Reader.readFileAsText()
                .then(content => {
                    this.scene = banana.SceneSerializer.deserialize(content);
                    this.sceneHierarchyPanel.setRefScene(this.scene);
                });
        }

        banana.ImGui.End();

        this.sceneHierarchyPanel.onImGuiRender();
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
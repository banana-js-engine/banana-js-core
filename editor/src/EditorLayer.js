import * as banana from "../../build/banana.js";

import { GamepadTestScript } from "./GamepadTestScript.js";

import { SceneHierarchyPanel } from "./panels/SceneHierarchyPanel.js";

/**
 * Example layer which demonstrates a simple ImGUI Panel
 */
export class EditorLayer extends banana.Layer {

    constructor() {
        super('Editor Layer');

        this.playText = "Play";
        this.audioVolume = [50];
        this.counter = 0;
        this.darkMode = true;
        this.clearColorIm = new banana.ImGui.Vec4(0.0, 0.0, 0.0, 1.0);
        this.fps = 75;

        
        this.scene = new banana.Scene('game scene');

        this.sceneHierarchyPanel = new SceneHierarchyPanel(this.scene);
    }

    onUpdate(deltaTime) {

        this.scene.onUpdateRuntime(deltaTime);

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

        banana.ImGui.SliderInt('Volume', this.audioVolume[0], [min=0, max=100, formatString= "%d", ImGuiSliderFlags=0]);
            
            
            if (banana.ImGui.Button(this.playText)){
                if (this.playText === "Play") {
                    this.playText = 'Pause';
                } else {
                    this.playText = 'Play';
                }

            }

            banana.ImGui.sameLine();

            if (banana.ImGui.Button("Restart")){

            }

        banana.ImGui.End();

        this.sceneHierarchyPanel.onImGuiRender();
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
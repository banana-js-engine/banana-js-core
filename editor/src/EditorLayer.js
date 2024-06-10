import * as banana from "../../build/banana.js";

import { GamepadTestScript } from "./GamepadTestScript.js";

import { SceneHierarchyPanel } from "./panels/SceneHierarchyPanel.js";

/**
 * Example layer which demonstrates a simple ImGUI Panel and main editor features
 */
export class EditorLayer extends banana.Layer {

    constructor() {
        super('Editor Layer');

        this.playText = "Play";
        this.audioVolume = 50;
        this.counter = 0;
        this.darkMode = true;
        this.clearColorIm = new banana.ImGui.Vec4(0.0, 0.0, 0.0, 1.0);
        this.fps = 75;
        
        banana.setAudio('/editor/src/testMaterial/testAudio.mp3');

        this.scene = new banana.Scene('game scene');

        this.menuBarPanel = new MenuBarPanel(this);
        this.projectSettingsPanel = new ProjectSettingsPanel();
        this.sceneHierarchyPanel = new SceneHierarchyPanel(this.scene, this.editorCameraController);
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

        if (banana.ImGui.SliderInt('Volume', (value = this.audioVolume) => this.audioVolume = value, 0, 100)){
            banana.ModifyVolume(this.audioVolume);
        }
            
            
        if (banana.ImGui.Button(this.playText)){
            if (this.playText === "Play") {
                this.playText = 'Pause';
                banana.Play();
            } else {
                this.playText = 'Play';
                banana.Pause()
            }
        }

        banana.ImGui.SameLine();

        if (banana.ImGui.Button("Restart")){
            banana.Reset();
        }

        banana.ImGui.End();

        this.menuBarPanel.onImGuiRender();
        this.projectSettingsPanel.onImGuiRender();
        this.sceneHierarchyPanel.onImGuiRender();
    }

    onEvent(event) {
        this.scene.onEvent(event);
        this.editorCameraController.onEvent(event);
    }

    runGame() {
        const windowWidth = this.projectSettingsPanel.gameWindowWidth;
        const windowHeight = this.projectSettingsPanel.gameWindowHeight;

        const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = screenLeft + (screenWidth - windowWidth) / 2;
        const top = screenTop + (screenHeight - windowHeight) / 2;

        const windowFeatures = `location=no,width=${windowWidth},height=${windowHeight},left=${left},top=${top}`;

        const gameWindow = window.open('/editor/game.html', '', windowFeatures);

        if (gameWindow) {
            gameWindow.focus();
        }

        setTimeout(() => {
            gameWindow.postMessage({ type: 'init', data: banana.SceneSerializer.serialize(this.scene) }, '*' );
        }, 300);
    }
}
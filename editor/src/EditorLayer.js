import * as banana from "../../build/banana.js";
import { MenuBarPanel } from "./panels/MenuBarPanel.js";
import { ProjectSettingsPanel } from "./panels/ProjectSettingsPanel.js";
import { SceneHierarchyPanel } from "./panels/SceneHierarchyPanel.js";

/**
 * Example layer which demonstrates a simple ImGUI Panel
 */
export class EditorLayer extends banana.Layer {

    constructor() {
        super('Editor Layer');

        this.editorCameraController = new banana.EditorCameraController();
        
        this.scene = new banana.Scene('game scene');

        this.menuBarPanel = new MenuBarPanel(this);
        this.projectSettingsPanel = new ProjectSettingsPanel();
        this.sceneHierarchyPanel = new SceneHierarchyPanel(this.scene, this.editorCameraController);
    }

    onUpdate(deltaTime) {
        this.scene.onUpdateEditor(deltaTime, this.editorCameraController);
    }

    onImGuiRender() {
        this.editorCameraController.update();

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
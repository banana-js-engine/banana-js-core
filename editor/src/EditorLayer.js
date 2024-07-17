import * as banana from "../../dist/banana.js";
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

        this.gameWindow = null;

        this.menuBarPanel = new MenuBarPanel(this);
        this.projectSettingsPanel = new ProjectSettingsPanel();
        this.sceneHierarchyPanel = new SceneHierarchyPanel(this.scene, this.editorCameraController);
    }

    get mainCamera() {
        const cameras = this.scene.registry.get_all(banana.ComponentType.CameraComponent);
        for (const camera of cameras) {
            if (camera.isPrimary) {
                return camera.getCamera();
            }
        }

        return null;
    }

    onUpdate(deltaTime) {
        this.scene.onUpdateEditor(deltaTime, this.editorCameraController, 
            this.projectSettingsPanel.gameWindowWidth / this.projectSettingsPanel.gameWindowHeight);

        if (this.mainCamera) {
            this.editorCameraController.getCamera().clearColor = banana.Color.copy(this.mainCamera.clearColor);
        }
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
        if (this.gameWindow && !this.gameWindow.closed) {
            this.gameWindow.location.reload();
            this.gameWindow.focus();

            this.gameWindow.postMessage({ type: 'init', data: banana.SceneSerializer.serialize(this.scene) }, '*' );
            this.gameWindow.postMessage({ type: 'title', data: this.scene.name }, '*' );
            return;
        }

        const windowWidth = this.projectSettingsPanel.gameWindowWidth;
        const windowHeight = this.projectSettingsPanel.gameWindowHeight;

        const screenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const screenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = screenLeft + (screenWidth - windowWidth) / 2;
        const top = screenTop + (screenHeight - windowHeight) / 2;

        const windowFeatures = `location=no,width=${windowWidth},height=${windowHeight},left=${left},top=${top}`;

        this.gameWindow = window.open('/game/', '', windowFeatures);

        if (this.gameWindow) {
            this.gameWindow.focus();
        }

        this.gameWindow.addEventListener('load', () => {
            setTimeout(() => {
                this.gameWindow.postMessage({ type: 'init', data: banana.SceneSerializer.serialize(this.scene) }, '*' );
                this.gameWindow.postMessage({ type: 'title', data: this.scene.name }, '*' );
            }, 500);
        });
    }
}
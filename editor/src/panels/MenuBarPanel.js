import * as banana from "../../../dist/banana.js";

export class MenuBarPanel {

    constructor(editorLayer) {
        this.editorLayer = editorLayer;
    }  

    onImGuiRender() {
        if (banana.ImGui.BeginMainMenuBar()) {
            if (banana.ImGui.BeginMenu('Game')) {
                if (banana.ImGui.MenuItem('Run')) {
                    this.editorLayer.runGame();
                }


                banana.ImGui.EndMenu();
            }

            if (banana.ImGui.BeginMenu('File')) {
                if (banana.ImGui.MenuItem('Save Scene')) {
                    banana.SceneSerializer.save( this.editorLayer.scene );
                }

                if (banana.ImGui.MenuItem('Load Scene')) {
                    this.editorLayer.sceneHierarchyPanel.selectedEntity = '';

                    banana.Reader.readFileAsText()
                    .then(content => {
                        this.editorLayer.scene = banana.SceneSerializer.deserialize(content);

                        this.editorLayer.sceneHierarchyPanel.setRefScene(this.editorLayer.scene);
                    });
                }

                banana.ImGui.EndMenu();
            }

            if (banana.ImGui.BeginMenu('Debug')) {
                if (banana.ImGui.MenuItem('Clear Cache')) {
                    localStorage.clear();
                }

                banana.ImGui.EndMenu();
            }

            banana.ImGui.EndMainMenuBar();
        }
    }
}
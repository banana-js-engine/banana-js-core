import * as banana from "../../../build/banana.js";

export class SceneHierarchyPanel {

    constructor(scene) {
        this.setRefScene(scene);

        this.selectedEntity;

        this.sceneHierarchyPanelDefaultSize = new banana.ImGui.ImVec2(300, 300); // hard-coded for now
        this.sceneHierarchyPanelDefaultPos = new banana.ImGui.ImVec2(300, 60); // hard-coded for now
    }

    onImGuiRender() {
        banana.ImGui.SetNextWindowSize(this.sceneHierarchyPanelDefaultSize, banana.ImGui.ImGuiCond.FirstUseEver);
        banana.ImGui.SetNextWindowPos(this.sceneHierarchyPanelDefaultPos, banana.ImGui.ImGuiCond.FirstUseEver);
        banana.ImGui.Begin('Scene Hierarchy');
        
        // right-click on empty space
        if (banana.ImGui.BeginPopupContextWindow()) {
            if (banana.ImGui.MenuItem('Create')) {
                this.refScene.createEntity('New Entity');
            }
            
            banana.ImGui.EndPopup();
        }
        
        const tags = this.refScene.registry.get_all_with_entity(banana.ComponentType.TagComponent);
        for (const [entity, tag] of Object.entries(tags)) {
            const flags = (this.selectedEntity == entity ? banana.ImGui.ImGuiTreeNodeFlags.Selected : 0) 
                | banana.ImGui.ImGuiTreeNodeFlags.OpenOnArrow;
            
            const opened = banana.ImGui.TreeNodeEx(entity, flags, tag.getName());

            if (banana.ImGui.IsItemClicked()) {
                this.selectedEntity = entity;
            }

            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.destroyEntity(new banana.Entity(entity, this.refScene));
                    if (this.selectedEntity == entity) {
                        this.selectedEntity = '';
                    }
                }

                banana.ImGui.EndPopup();
            }
            if (opened) {
                banana.ImGui.TreePop();
            }
        }

        banana.ImGui.End();
    }

    setRefScene(scene) {
        this.refScene = scene;
    }
}
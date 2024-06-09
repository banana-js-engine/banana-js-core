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
            this.drawEntity(entity, tag);
        }

        banana.ImGui.End();

        banana.ImGui.Begin('Properties');

        if (this.selectedEntity) {
            this.drawComponents();
        }

        banana.ImGui.End();
    }

    drawEntity(entity, tag) {
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

    drawComponents() {
        // Tag Component
        const tag = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.TagComponent);
        let newTag = ''
        if (banana.ImGui.InputText('Name', (value = tag.getName()) => newTag = value)) {
            tag.setName(newTag);
        }

        // Transform Component
        if (banana.ImGui.TreeNodeEx('TransformComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Transform')) {
            const transform = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.TransformComponent);
    
            banana.ImGui.DragFloat3('Position', transform.getPosition(), 0.1);
            banana.ImGui.DragFloat3('Rotation', transform.getRotation(), 0.1);
            banana.ImGui.DragFloat3('Scale', transform.getScale(), 0.1);

            banana.ImGui.TreePop();
        }

        // Sprite Renderer Component
        if (this.refScene.registry.has(this.selectedEntity, banana.ComponentType.SpriteRendererComponent)) {
            if (banana.ImGui.TreeNodeEx('SpriteRendererComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Sprite Renderer')) {
                const sprite = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.SpriteRendererComponent);

                banana.ImGui.ColorEdit4('Color', sprite.getColor());
            }
        }

    }

    setRefScene(scene) {
        this.refScene = scene;
    }
}
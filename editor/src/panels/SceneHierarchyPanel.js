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

        if (banana.ImGui.Button('Add Component')) {
            banana.ImGui.OpenPopup('AddComponent');
        }

        if (banana.ImGui.BeginPopup('AddComponent')) {
            this.drawAddComponent(banana.ComponentType.CameraComponent, 'Camera');
            this.drawAddComponent(banana.ComponentType.SpriteRendererComponent, 'Sprite Renderer');
            this.drawAddComponent(banana.ComponentType.CircleRendererComponent, 'Circle Renderer');
            this.drawAddComponent(banana.ComponentType.TextRendererComponent, 'Text Renderer');
            this.drawAddComponent(banana.ComponentType.Body2DComponent, 'Body2D');

            banana.ImGui.EndPopup();
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
            let opened = banana.ImGui.TreeNodeEx('SpriteRendererComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Sprite Renderer');

            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.registry.remove(this.selectedEntity, banana.ComponentType.SpriteRendererComponent);
                }
    
                banana.ImGui.EndPopup();

                opened = false;
            }

            if (opened) {
                const sprite = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.SpriteRendererComponent);

                banana.ImGui.ColorEdit4('Color', sprite.getColor());

                banana.ImGui.TreePop();
            }
        }

        // Circle Renderer Component
        if (this.refScene.registry.has(this.selectedEntity, banana.ComponentType.CircleRendererComponent)) {
            let opened = banana.ImGui.TreeNodeEx('CircleRendererComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Circle Renderer');
                
            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.registry.remove(this.selectedEntity, banana.ComponentType.CircleRendererComponent);
                }
    
                banana.ImGui.EndPopup();

                opened = false;
            }

            if (opened) {
                const circle = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.CircleRendererComponent);

                const circleThickness = [ circle.thickness ];
                const circleFade = [ circle.fade ];

                banana.ImGui.ColorEdit4('Color', circle.color);
                banana.ImGui.DragFloat('Thickness', circleThickness, 0.01);
                banana.ImGui.DragFloat('Fade', circleFade, 0.01);

                circle.thickness = circleThickness[0];
                circle.fade = circleFade[0];

                banana.ImGui.TreePop();
            }
        }

        // Text Renderer Component
        if (this.refScene.registry.has(this.selectedEntity, banana.ComponentType.TextRendererComponent)) {
            let opened = banana.ImGui.TreeNodeEx('TextRendererComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Text Renderer');

            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.registry.remove(this.selectedEntity, banana.ComponentType.TextRendererComponent);
                }
    
                banana.ImGui.EndPopup();

                opened = false;
            }

            if (opened) {
                const textRenderer = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.TextRendererComponent);

                let newText = textRenderer.text;

                if (banana.ImGui.InputText('Name', (value = newText) => newText = value)) {
                    textRenderer.setText(newText);
                }

                banana.ImGui.TreePop();
            }
        }

        // Camera Component
        if (this.refScene.registry.has(this.selectedEntity, banana.ComponentType.CameraComponent)) {
            let opened = banana.ImGui.TreeNodeEx('CameraComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Camera');

            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.registry.remove(this.selectedEntity, banana.ComponentType.CameraComponent);
                }
    
                banana.ImGui.EndPopup();

                opened = false;
            }

            if (opened) {
                const camera = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.CameraComponent);

                const projectionTypes = [ 'Orthographic', 'Perspective' ];
                let currentProjection = projectionTypes[camera.getType() == banana.CameraType.Orthographic ? 0 : 1];

                let isPrimary = camera.isPrimary;

                if (banana.ImGui.Checkbox('Primary', (value = isPrimary) => isPrimary = value)) {
                    camera.isPrimary = isPrimary;
                }

                if (banana.ImGui.BeginCombo('Proj. Type', currentProjection)) {
                    for (let i = 0; i < 2; i++) {
                        const isSelected = (currentProjection == projectionTypes[i]);
                        if (banana.ImGui.Selectable(projectionTypes[i], isSelected)) {
                            currentProjection = projectionTypes[i];
                        }
                        if (isSelected) {
                            banana.ImGui.SetItemDefaultFocus();
                        }
                    }

                    camera.getCamera().projType = currentProjection;
                    banana.ImGui.EndCombo();
                }


                if (camera.getType() == banana.CameraType.Orthographic) {
                    const cameraSize = [ camera.getCamera().size ];
                    const cameraNear = [ camera.getCamera().orthographicNear ];
                    const cameraFar = [ camera.getCamera().orthographicFar ];

                    banana.ImGui.DragFloat('Size', cameraSize, 0.1);
                    banana.ImGui.DragFloat('Near', cameraNear, 0.1);
                    banana.ImGui.DragFloat('Far', cameraFar, 0.1);

                    camera.getCamera().size = cameraSize[0];
                    camera.getCamera().orthographicNear = cameraNear[0];
                    camera.getCamera().orthographicFar = cameraFar[0];

                    camera.getCamera().setViewportSize();
                }
                else if (camera.getType() == banana.CameraType.Perspective) {
                    const cameraFovy = [ camera.getCamera().fovy ];
                    const cameraNear = [ camera.getCamera().perspectiveNear ];
                    const cameraFar = [ camera.getCamera().perspectiveFar ];

                    banana.ImGui.DragFloat('FOVY', cameraFovy, 0.1);
                    banana.ImGui.DragFloat('Near', cameraNear, 0.1);
                    banana.ImGui.DragFloat('Far', cameraFar, 0.1);

                    camera.getCamera().fovy = cameraFovy[0];
                    camera.getCamera().perspectiveNear = cameraNear[0];
                    camera.getCamera().perspectiveFar = cameraFar[0];

                    camera.getCamera().setViewportSize();
                }

                banana.ImGui.TreePop();
            }
        }

        // Body2D Component
        if (this.refScene.registry.has(this.selectedEntity, banana.ComponentType.Body2DComponent)) {
            let opened = banana.ImGui.TreeNodeEx('Body2DComponent', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Body2D');

            if (banana.ImGui.BeginPopupContextItem()) {
                if (banana.ImGui.MenuItem('Delete')) {
                    this.refScene.registry.remove(this.selectedEntity, banana.ComponentType.Body2DComponent);
                }
    
                banana.ImGui.EndPopup();

                opened = false;
            }

            if (opened) {
                const body2d = this.refScene.registry.get(this.selectedEntity, banana.ComponentType.Body2DComponent);

                const bodyTypes = [ 'Circle', 'Box' ];
                let currentBodyType = bodyTypes[body2d.body2d.shapeType == banana.ShapeType.Circle ? 0 : 1];

                if (banana.ImGui.BeginCombo('Shape Type', currentBodyType)) {
                    for (let i = 0; i < 2; i++) {
                        const isSelected = (currentBodyType == bodyTypes[i]);
                        if (banana.ImGui.Selectable(bodyTypes[i], isSelected)) {
                            currentBodyType = bodyTypes[i];
                        }
                        if (isSelected) {
                            banana.ImGui.SetItemDefaultFocus();
                        }
                    }

                    body2d.setShape(currentBodyType == 'Circle' ? banana.ShapeType.Circle : banana.ShapeType.Box);
                    banana.ImGui.EndCombo();
                }

                banana.ImGui.TreePop();
            }
        }
    }

    drawAddComponent(componentType, componentName) {
        if (!this.refScene.registry.has(this.selectedEntity, componentType)) {
            if (banana.ImGui.MenuItem(componentName)) {
                const entity = new banana.Entity(this.selectedEntity, this.refScene);
                entity.addComponent(componentType);
                banana.ImGui.CloseCurrentPopup();
            }
        }
    }

    setRefScene(scene) {
        this.refScene = scene;
    }
}
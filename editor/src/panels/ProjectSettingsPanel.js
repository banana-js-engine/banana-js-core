import * as banana from "../../../dist/banana.js";

export class ProjectSettingsPanel {

    get darkModeEnabled() {
        const cachedValue = localStorage.getItem('darkModeEnabled');
        if (cachedValue) {
            return cachedValue == 'true';
        }

        return true;
    }

    set darkModeEnabled(newValue) {
        localStorage.setItem('darkModeEnabled', newValue.toString());
    }

    get gameWindowWidth() {
        const cachedValue = localStorage.getItem('gameWindowWidth');
        if (cachedValue) {
            return parseInt(cachedValue);
        }

        return 600;
    }

    set gameWindowWidth(newValue) {
        localStorage.setItem('gameWindowWidth', newValue.toString());
    }

    get gameWindowHeight() {
        const cachedValue = localStorage.getItem('gameWindowHeight');
        if (cachedValue) {
            return parseInt(cachedValue);
        }

        return 600;
    }

    set gameWindowHeight(newValue) {
        localStorage.setItem('gameWindowHeight', newValue.toString());
    }

    onImGuiRender() {
        banana.ImGui.Begin('Project Settings');

        let width = [ this.gameWindowWidth ];
        let height = [ this.gameWindowHeight ];

        banana.ImGui.InputInt('Width', width);
        banana.ImGui.InputInt('Height', height);

        this.gameWindowWidth = width;
        this.gameWindowHeight = height;

        banana.ImGui.Checkbox('Dark Mode', (value = this.darkModeEnabled) => this.darkModeEnabled = value);

        if (this.darkModeEnabled) {
            banana.ImGui.StyleColorsDark();
        }
        else { 
            banana.ImGui.StyleColorsLight();
        }

        let opened = banana.ImGui.TreeNodeEx('PhysicsSettings', banana.ImGui.ImGuiTreeNodeFlags.DefaultOpen, 'Physics');

        if (opened) {
            banana.ImGui.Checkbox('Rotation', (value = banana.PhysicsWorld.withRotation) => banana.PhysicsWorld.withRotation = value);
            banana.ImGui.Checkbox('Friction', (value = banana.PhysicsWorld.withFriction) => banana.PhysicsWorld.withFriction = value);

            banana.ImGui.TreePop();
        }
        
        banana.ImGui.End();
    }
}
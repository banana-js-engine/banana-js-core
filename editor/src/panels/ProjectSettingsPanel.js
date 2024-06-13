import * as banana from "../../../build/banana.js";

export class ProjectSettingsPanel {
    constructor() {
        this.gameWindowWidth = [ 600 ];
        this.gameWindowHeight = [ 600 ];

        this.darkModeEnabled = true;
    }

    onImGuiRender() {
        banana.ImGui.Begin('Project Settings');

        banana.ImGui.InputInt('Width', this.gameWindowWidth);
        banana.ImGui.InputInt('Height', this.gameWindowHeight);

        banana.ImGui.Checkbox("Dark Mode", (value = this.darkModeEnabled) => this.darkModeEnabled = value);

        if (this.darkModeEnabled) {
            banana.ImGui.StyleColorsDark();
        }
        else { 
            banana.ImGui.StyleColorsLight();
        }
        
        banana.ImGui.End();
    }
}
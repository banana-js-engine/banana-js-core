import * as banana from "../../../build/banana.js";

export class ProjectSettingsPanel {
    constructor() {
        this.gameWindowWidth = [ 600 ];
        this.gameWindowHeight = [ 600 ];

        this.darkModeEnabled = true;

        this.clearColorIm = new banana.ImGui.ImVec4(0.0, 0.0, 0.0, 1.0);
        this.clearColor = new banana.Color(0, 0, 0, 1);
    }

    onImGuiRender() {
        banana.ImGui.Begin('Project Settings');

        banana.ImGui.InputInt('Width', this.gameWindowWidth);
        banana.ImGui.InputInt('Height', this.gameWindowHeight);

        banana.ImGui.Checkbox("Dark Mode", (value = this.darkModeEnabled) => this.darkModeEnabled = value);

        banana.ImGui.ColorEdit4('Clear Color', this.clearColorIm);


        if (this.darkModeEnabled) {
            banana.ImGui.StyleColorsDark();
        }
        else { 
            banana.ImGui.StyleColorsLight();
        }

        this.clearColor.r = this.clearColorIm.x;
        this.clearColor.g = this.clearColorIm.y;
        this.clearColor.b = this.clearColorIm.z;
        this.clearColor.a = this.clearColorIm.w;
        banana.RenderCommand.setClearColor( this.clearColor );
        
        banana.ImGui.End();
    }
}
import { Layer } from "./Layer.js";

import { ImGui, ImGui_Impl } from "./EntryPoint.js";
import { gl } from "../render/WebGLContext.js";

export class ImGUILayer extends Layer {

    imGuiRefreshRate: number;

    constructor() {
        super('ImGUILayer');

        this.imGuiRefreshRate = (1 / 75);
    }
    
    onAttach() {
        ImGui.CHECKVERSION();
        ImGui.CreateContext();
        
        const io = ImGui.GetIO();
        ImGui.StyleColorsDark();
        io.Fonts.AddFontDefault();
        io.WantCaptureMouse = true;
        io.WantCaptureKeyboard = true;

        ImGui_Impl.Init(gl);
    }

    begin() {
        ImGui_Impl.NewFrame(this.imGuiRefreshRate);
        ImGui.NewFrame();
    }

    end() {
        ImGui.EndFrame();
        ImGui.Render();
        ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
    }

    onDetach() {
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }
}

import { Layer } from "./Layer.js";

import { ImGui, ImGui_Impl } from "./EntryPoint.js";
import { gl } from "../render/WebGLContext.js";

export class ImGUILayer extends Layer {
    constructor() {
        super('ImGUILayer');
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

    onDetach() {
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }
}

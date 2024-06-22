import { Application } from "./Application.js"
import { Log } from "./Log.js"
import { Profiler } from "./Profiler.js";

import { loadImgui, loadImguiImpl } from "../loadImgui.js"

export let ImGui;
export let ImGui_Impl;

export async function main() {
    Log.Core_Info('Engine initialized');

    ImGui = await loadImgui();

    await ImGui.default();

    ImGui_Impl = await loadImguiImpl();

    // init profiling
    //Profiler.BeginProfile('Application Init');
    let bananaApp = Application.createApplication(); 
    //Profiler.EndProfile();

    Log.Info('Game started');

    Profiler.beginProfile('Application Runtime', 'Runtime.json');
    bananaApp.run();

}

window.onload = main;
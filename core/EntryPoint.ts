import { Mat4 } from "../banana.js";
import { Application } from "./Application.js"
import { Log } from "./Log.js"
import { Profiler } from "./Profiler.js";

export function main() {
    Log.Core_Info('Engine initialized');

    // init profiling
    //Profiler.BeginProfile('Application Init');
    let bananaApp = Application.createApplication(); 
    //Profiler.EndProfile();

    Log.Info('Game started');

    Profiler.beginProfile('Application Runtime', 'Runtime.json');
    bananaApp.run();

}

window.onload = main;
import * as banana from "../../build/banana.js";
import { GameLayer } from "./GameLayer.js";

/**
 * The banana application that represents the editor.
 */
class RuntimeApplication extends banana.Application {
    constructor() {
        super('game', window.outerWidth, window.outerHeight);
        
        this.pushLayer(new GameLayer());
    }
}

banana.Application.createApplication = function() {
    return new RuntimeApplication();
}
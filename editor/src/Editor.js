import * as banana from "../../build/banana.js";
import { EditorLayer } from './EditorLayer.js';

/**
 * The banana application that represents the editor.
 */
class EditorApplication extends banana.Application {
    constructor() {
        super('banana editor', window.innerWidth, window.innerHeight);
        
        this.pushLayer(new EditorLayer());
    }
}

banana.Application.createApplication = function() {
    return new EditorApplication();
}
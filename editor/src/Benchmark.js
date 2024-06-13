import * as banana from "../../build/banana.js";
import { BenchmarkLayer } from './BenchmarkLayer.js';

/**
 * The banana application that represents the editor.
 */
class EditorApplication extends banana.Application {
    constructor() {
        super('banana editor', window.innerWidth, window.innerHeight);
        
        this.pushLayer(new BenchmarkLayer());
    }
}

banana.Application.createApplication = function() {
    return new EditorApplication();
}
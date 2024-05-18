import { TestLayer } from './TestLayer.js';
import * as banana from './banana.js';

class TestApplication extends banana.Application {
    constructor() {
        super('test', 600, 600);

        this.pushLayer(new TestLayer());
    }

    onWindowResized(event) {
        banana.RenderCommand.setViewport(banana.canvas.width, banana.canvas.height);
        return true;
    }
}

banana.Application.createApplication = function() {
    return new TestApplication();
}
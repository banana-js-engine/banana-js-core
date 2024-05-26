import { TestLayer } from './TestLayer.js';
import * as banana from './banana.js';

class TestApplication extends banana.Application {
    constructor() {
        super('banana test', window.innerWidth, window.innerHeight);

        this.pushLayer(new TestLayer());
    }
}

banana.Application.createApplication = function() {
    return new TestApplication();
}
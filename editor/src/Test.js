import * as banana from "../../build/banana.js";
import { TestLayer } from "./TestLayer.js";

/**
 * Use this application for testing/debugging purposes
 */
class TestApplication extends banana.Application {
    constructor() {
        super('banana test', window.innerWidth, window.innerHeight);
        
        this.pushLayer(new TestLayer());
    }
}

banana.Application.createApplication = function() {
    return new TestApplication();
}
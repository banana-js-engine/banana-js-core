import * as banana from "../../dist/banana.js";
import { TestLayer } from "./TestLayer.js";

/**
 * Use this application for testing/debugging purposes
 */
class TestApplication extends banana.Application {
    constructor() {
        super('banana test', 1920, 1080);
        
        this.pushLayer(new TestLayer());
    }
}

banana.Application.createApplication = function() {
    return new TestApplication();
}
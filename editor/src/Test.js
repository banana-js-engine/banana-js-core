import * as banana from "../../build/banana.js";
import { TestLayer } from "./TestLayer.js";

/**
 * Use this application for testing/debugging purposes
 */
class TestApplication extends banana.Application {
    constructor() {
        super('banana test', 600, 800);
        
        this.pushLayer(new TestLayer());
    }
}

banana.Application.createApplication = function() {
    return new TestApplication();
}
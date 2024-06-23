import * as banana from "../../dist/banana.js";
import { GameLayer } from "./GameLayer.js";

/**
 * The banana application that represents the editor.
 */
class RuntimeApplication extends banana.Application {
    constructor() {
        super('Loading...', window.outerWidth, window.outerHeight);
        
        this.pushLayer(new GameLayer());

        if (localStorage.getItem('title')) {
            this.setTitle(localStorage.getItem('title'));
        }

        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) {
                return;
            }
            
            const message = event.data;
            if (message.type == 'title') {
                this.setTitle(message.data);

                localStorage.setItem('title', message.data);
            }
        });
    }
}

banana.Application.createApplication = function() {
    return new RuntimeApplication();
}
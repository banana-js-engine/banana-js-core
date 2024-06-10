import * as banana from "../../build/banana.js";

/**
 * Use this layer as a testing measure in your issues
 */
export class GameLayer extends banana.Layer {

    constructor() {
        super('Game Layer');

        this.scene = new banana.Scene('temp');

        const sceneData = window.localStorage.getItem('sceneData');

        if (sceneData) {
            this.scene = banana.SceneSerializer.deserialize(sceneData);
        }

        window.addEventListener('message', (event) =>{
            
            if (event.origin !== window.location.origin) {
                return;
            }
        
            const message = event.data;
            if (message.type == 'init') {
                this.scene = banana.SceneSerializer.deserialize(message.data);
                   
                // caching
                window.localStorage.setItem('sceneData', message.data);
            }
        });
    }

    onUpdate(deltaTime) {
        this.scene.onUpdateRuntime(deltaTime);
    }

    onEvent(event) {
        this.scene.onEvent(event);
    }
}
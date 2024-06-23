import * as banana from "../../dist/banana.js";

/**
 * Use this layer as a testing measure in your issues
 */
export class GameLayer extends banana.Layer {

    constructor() {
        super('Game Layer');

        this.firstFlag = false;
        this.secondFlag = false;
        this.scene = new banana.Scene('temp');

        const sceneData = window.localStorage.getItem('sceneData');

        if (sceneData) {
            this.scene = banana.SceneSerializer.deserialize(sceneData);
            this.firstFlag = true;

            setTimeout(() => {
                this.secondFlag = true
            }, 500);
        }

        window.addEventListener('message', (event) =>{     
            if (event.origin !== window.location.origin) {
                return;
            }
            
            const message = event.data;
            if (message.type == 'init') {
                this.scene = banana.SceneSerializer.deserialize(message.data);
                this.secondFlag = true;

                // caching
                window.localStorage.setItem('sceneData', message.data);
            }
        });
    }

    onUpdate(deltaTime) {
        if (this.firstFlag && this.secondFlag) {
            this.scene.onUpdateRuntime(deltaTime);
        }
    }

    onEvent(event) {
        if (this.firstFlag && this.secondFlag) {
            this.scene.onEvent(event);
        }
    }
}
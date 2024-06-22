import * as banana from '../../dist/banana.js';

export class TestScript extends banana.ScriptableEntity {
    onCreate() {
        banana.Log.Info('I AM ALIVE');
    }

    onUpdate(deltaTime) {
        if (banana.Input.isKeyPressed(banana.KeyCode.D)) {
            this.transform.translate(deltaTime, 0, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.A)) {
            this.transform.translate(-deltaTime, 0, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.W)) {
            this.transform.translate(0, -deltaTime, 0);
        }
        if (banana.Input.isKeyPressed(banana.KeyCode.S)) {
            this.transform.translate(0, deltaTime, 0);
        }
    }
}
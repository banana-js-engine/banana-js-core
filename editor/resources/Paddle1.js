import * as banana from '../../dist/banana.js';

export class Paddle1 extends banana.ScriptableEntity {
    
    // Use this function for initialization.
    onCreate() {
        
    }

    // This function is called once per frame.
    onUpdate(deltaTime) {
        if (banana.Input.isKeyPressed(banana.KeyCode.W)) {
            this.transform.translate(0, -deltaTime * 4, 0);
        }

        if (banana.Input.isKeyPressed(banana.KeyCode.S)) {
            this.transform.translate(0, deltaTime * 4, 0);
        }
    }
}
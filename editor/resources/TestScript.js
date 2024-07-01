import * as banana from '../../dist/banana.js';

export class TestScript extends banana.ScriptableEntity {

    textToDisplay = '';

    onCreate() {
        banana.Log.Info('I AM ALIVE');
        this.textRenderer = this.getComponent(banana.ComponentType.TextRendererComponent);
        this.textRenderer.setText(this.textToDisplay);
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


        if (banana.Input.isMouseButtonPressed(banana.MouseButton.MOUSE_RIGHT)) {
            this.transform.setPosition( this.mainCamera.screenToViewportSpace( banana.Input.mousePosition ) );
        }
    }
}
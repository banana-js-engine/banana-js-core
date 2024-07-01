import * as banana from '../../dist/banana.js';

export class Ball extends banana.ScriptableEntity {
    
    moveSpeed = 5;

    // Use this function for initialization.
    onCreate() {
        this.body2d = this.getComponent(banana.ComponentType.Body2DComponent);
        this.body2d.addForce(new banana.Vec2(this.moveSpeed, this.moveSpeed));
    }

    // This function is called once per frame.
    onUpdate(deltaTime) {
        
    }
}
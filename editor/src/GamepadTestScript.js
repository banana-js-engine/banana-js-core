import * as banana from '../../build/banana.js';

export class GamepadTestScript extends banana.ScriptableEntity {
    onUpdate(deltaTime) {
        if (banana.Input.getJoystickStrength( banana.GamepadInputCode.Left_Stick_Strength_Horizontal ) > 0.3) {
            banana.Log.Info('LEFT > 0.3');
        }
    }
}
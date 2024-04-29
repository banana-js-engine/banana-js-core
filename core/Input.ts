import { Vec2 } from '../math/MV.ts';
import { Gamepad } from './Gamepad.ts'
import { Log } from './Log.ts'

export class Input {
    private static _gamepadWarningFlag = true;

    public static isKeyPressed(key) {
        if (typeof Input.keyStates[key] == 'undefined') {
            Input.keyStates[key] = false;
        }

        return Input.keyStates[key];
    }

    public static isMouseButtonPressed(button) {
        let key = `${button}`;
        
        if (typeof Input.buttonStates[key] == 'undefined') {
            Input.buttonStates[key] = false;
        }

        return Input.buttonStates[key];
    }

    public static isGamepadButtonPressed(button) {
        if (!Gamepad.Instance.isGamepadConnected) {
            if (this._gamepadWarningFlag) {
                Log.Warn('No gamepad is connected!');
                this._gamepadWarningFlag = false;
            }
            return false;
        } 
        
        this._gamepadWarningFlag = true;
        return Gamepad.Instance.currentGamepad.buttons[button].pressed;
    }

    public static getJoystickStrength(axis: number): number {
        if (!Gamepad.Instance.isGamepadConnected) {
            if (this._gamepadWarningFlag) {
                Log.Warn('No gamepad is connected!');
                this._gamepadWarningFlag = false;
            }
            return 0;
        } 

        this._gamepadWarningFlag = true;
        return Gamepad.Instance.currentGamepad.axes[axis];
    }

    public static mousePosition = new Vec2(0, 0);

    public static keyStates = {};
    public static buttonStates = {};
}
import { EventDispatcher, EventType } from "../event/Event.js";

export class Gamepad {
    public static Instance: Gamepad;

    private _isGamepadConnected: boolean;
    private _currentGamepadIndex: number | null;

    constructor() {
        if (!Gamepad.Instance) {
            Gamepad.Instance = this;

            this._isGamepadConnected = false;
            this._currentGamepadIndex = null;

            this.onGamepadConnected = this.onGamepadConnected.bind(this);
            this.onGamepadDisconnected = this.onGamepadDisconnected.bind(this);
        }

        return Gamepad.Instance;
    }

    public onEvent(event) {
        let dispatcher = new EventDispatcher(event);

        dispatcher.dispatch(this.onGamepadConnected, EventType.GamepadConnectedEvent);
        dispatcher.dispatch(this.onGamepadDisconnected, EventType.GamepadDisconnectedEvent);
    }

    private onGamepadConnected(event) {
        this._currentGamepadIndex = event.gamepad.index;
        this._isGamepadConnected = true;
    }
    
    private onGamepadDisconnected(event) {
        if (this._currentGamepadIndex === event.gamepad.index) {
            this._currentGamepadIndex = null;
            this._isGamepadConnected = false;
        }
    }

    public get currentGamepad() {
        if (!this.isGamepadConnected || this._currentGamepadIndex === null) {
            return null;
        }

        return navigator.getGamepads()[this._currentGamepadIndex];
    }

    public get isGamepadConnected() {
        return this._isGamepadConnected;
    }
}

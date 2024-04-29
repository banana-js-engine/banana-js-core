import { Event, EventDispatcher, EventType } from "../event/Event.ts"

export class Gamepad 
{
    public static Instance: Gamepad;

    private _isGamepadConnected: boolean;
    private _currentGamepad: GamepadEvent['gamepad'];

    constructor() {
        if (!Gamepad.Instance) {
            Gamepad.Instance = this;

            this._isGamepadConnected = false;
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
        this._currentGamepad = event.getGamepad(); 

        this._isGamepadConnected = true;
    }
    
    private onGamepadDisconnected(event) {
        this._currentGamepad = undefined;

        this._isGamepadConnected = false;
    }

    public get currentGamepad() {
        return navigator.getGamepads()[this._currentGamepad.index];
    }

    public get isGamepadConnected() {
        return this._isGamepadConnected;
    }
}
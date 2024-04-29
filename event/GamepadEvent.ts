import { Event, EventCategory, EventType } from "./Event.ts"

class GamepadEventt extends Event {
    
    gamepad: GamepadEvent['gamepad'];
    
    constructor(gamepad: GamepadEvent['gamepad']) {
        super();

        this.gamepad = gamepad;
    }

    override getCategoryFlags() {
        return EventCategory.Gamepad;
    }

    getGamepad() {
        return this.gamepad;
    }


    toString() {
        return `${this.getEventName()}: Gamepad id: ${this.getGamepad().id}
                                        buttons: ${this.getGamepad().buttons.length}`;
    }
}

export class GamepadConnectedEvent extends GamepadEventt
{
    override getEventType() {
        return EventType.GamepadConnectedEvent;
    }

    override getEventName() {
        return 'gamepadconnected';
    }
}

export class GamepadDisconnectedEvent extends GamepadEventt
{
    override getEventType() {
        return EventType.GamepadDisconnectedEvent;
    }

    override getEventName() {
        return 'gamepaddisconnected';
    }
}
import { KeyCode } from "../core/KeyCode.js";
import { Event, EventCategory, EventType } from "./Event.js"

class KeyboardEvent extends Event {
    
    key: KeyCode;
    
    constructor(key: KeyCode) {
        super();
        this.key = key;
    }

    override getCategoryFlags() {
        return EventCategory.Keyboard;
    }

    getKey() {
        return this.key;
    }

    toString() {
        return `${this.getEventName()}: Key=${this.getKey()}`;
    }
}

export class KeyboardButtonPressedEvent extends KeyboardEvent {
    override getEventType() {
        return EventType.KeyboardButtonPressedEvent;
    }

    override getEventName() {
        return 'keydown';
    }
}

export class KeyboardButtonReleasedEvent extends KeyboardEvent 
{
    override getEventType() {
        return EventType.KeyboardButtonReleasedEvent;
    }

    override getEventName() 
    {
        return 'keyup';
    }
}
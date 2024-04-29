export enum EventCategory {
    None,
    Application,
    Mouse,
    MouseButton,
    Keyboard,
    Gamepad,
}

export enum EventType {
    None,
    MouseMovedEvent,
    MouseScrolledEvent,
    MouseButtonClickedEvent,
    MouseButtonReleasedEvent,
    KeyboardButtonPressedEvent,
    KeyboardButtonReleasedEvent,
    WindowResizedEvent,
    WindowClosedEvent,
    GamepadConnectedEvent,
    GamepadDisconnectedEvent,
}

export class Event {
    handled: boolean;
    
    constructor() {    
        this.handled = false;
    }

    getCategoryFlags() {
        return EventCategory.None;
    }

    getEventType() {
        return EventType.None;
    }
    
    getEventName() {
        return '';
    }

    isInCategory(category) {
        return this.getCategoryFlags() & category;
    }
}

export class EventDispatcher {
    event: Event;

    constructor(event) {
        this.event = event;
    }

    dispatch(dispatchFn, eventType) {
        if (this.event.getEventType() == eventType) {
            this.event.handled = dispatchFn(this.event);
            return true;
        }

        return false;
    }
}
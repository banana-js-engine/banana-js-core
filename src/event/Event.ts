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

    isInCategory(category: EventCategory) {
        return this.getCategoryFlags() & category;
    }
}

export class EventDispatcher {
    event: Event;

    constructor(event: Event) {
        this.event = event;
    }

    dispatch(dispatchFn: Function, eventType: EventType) {
        if (this.event.getEventType() == eventType) {
            this.event.handled = dispatchFn(this.event);
            return true;
        }

        return false;
    }
}
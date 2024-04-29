import { Event, EventCategory, EventType } from "./Event.ts";

class MouseEvent extends Event {

    mousePositionX: number;
    mousePositionY: number;

    constructor(mousePositionX: number, mousePositionY: number) {
        super();
        this.mousePositionX = mousePositionX;
        this.mousePositionY = mousePositionY;
    }

    override getCategoryFlags() {
        return EventCategory.Mouse;
    }

    toString() {
        return `${this.getEventName()}: Pos=(${this.mousePositionX}, ${this.mousePositionY})`;
    }
}

export class MouseMovedEvent extends MouseEvent {
    override getEventType() {
        return EventType.MouseMovedEvent;
    }

    override getEventName() {
        return 'mousemove';
    }
}

export class MouseScrolledEvent extends Event {
    offsetX: number;
    offsetY: number;

    constructor(offsetX: number, offsetY: number) {
        super();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    override getCategoryFlags() {
        return EventCategory.Mouse;
    }

    override getEventType() {
        return EventType.MouseScrolledEvent;
    }

    override getEventName() {
        return 'wheel';
    }

    getOffsetY() {
        return this.offsetY;
    }

    toString() {
        return `${this.getEventName()}: Offset=(${this.offsetX}, ${this.offsetY})`;
    }
}

class MouseButtonEvent extends MouseEvent {
    
    button: MouseButtonEvent;
    
    constructor(mousePositionX: number, mousePositionY: number, button: MouseButtonEvent) {
        super(mousePositionX, mousePositionY);
        this.button = button;
    }

    override getCategoryFlags() {
        return EventCategory.MouseButton;
    }

    toString() {
        return `${this.getEventName()}: Button=${this.button}, Pos=(${this.mousePositionX}, ${this.mousePositionY})`;
    }
}


export class MouseButtonClickedEvent extends MouseButtonEvent {
    override getEventType() {
        return EventType.MouseButtonClickedEvent;
    }

    override getEventName() {
        return 'mousedown';
    }
}

export class MouseButtonReleasedEvent extends MouseButtonEvent {
    override getEventType() {
        return EventType.MouseButtonReleasedEvent;
    }

    override getEventName() {
        return 'mouseup';
    }
} 
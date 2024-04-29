import { Event, EventCategory, EventType } from "./Event.ts";

class ApplicationEvent extends Event {
    override getCategoryFlags() {
        return EventCategory.Application;
    }
}

export class WindowResizedEvent extends ApplicationEvent {
    
    width: number;
    height: number;
    
    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
    }

    override getEventType() {
        return EventType.WindowResizedEvent;
    }

    override getEventName() {
        return 'resize';
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    toString() {
        return `${this.getEventName()}: [${this.width}, ${this.height}]`
    }
}

export class WindowClosedEvent extends ApplicationEvent {
    override getEventType() {
        return EventType.WindowClosedEvent;
    }

    override getEventName() {
        return 'close';
    }

    toString() {
        return `${this.getEventName()}`;
    }
}
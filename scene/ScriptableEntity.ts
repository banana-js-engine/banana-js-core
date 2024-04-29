import { ComponentType, Entity, TagComponent, TransformComponent } from "../banana.js"

export class ScriptableEntity {

    entity: Entity;
    tag: TagComponent
    transform: TransformComponent;

    constructor() {
        this.entity = null;
    }

    getComponent<T>(componentType): T {
        return this.entity.getComponent(componentType);
    }

    onCreate() {}
    onUpdate(deltaTime) {}
    onDestroy() {}

    // DONT INHERIT THESE METHODS
    onCreateSealed() {
        this.tag = this.getComponent<TagComponent>(ComponentType.TagComponent);
        this.transform = this.getComponent<TransformComponent>(ComponentType.TransformComponent);
    }
}
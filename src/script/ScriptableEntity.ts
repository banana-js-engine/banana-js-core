import { CameraComponent, ComponentType, Entity, TagComponent, TransformComponent, Vec2 } from "../banana.js"

export class ScriptableEntity {

    entity: Entity;
    tag: TagComponent;
    transform: TransformComponent;

    constructor() {
        this.entity = null;
    }

    get mainCamera() {
        const cameras = this.entity.scene.registry.get_all<CameraComponent>(ComponentType.CameraComponent);
        for (const camera of cameras) {
            if (camera.isPrimary) {
                return camera.getCamera();
            }
        }

        return null;
    }

    getComponent<T>(componentType: ComponentType): T {
        return this.entity.getComponent(componentType);
    }

    instantiate(position: Vec2) {

        const tagComponent = this.entity.getComponent<TagComponent>(ComponentType.TagComponent);

        const clonedEntity = this.entity.scene.createEntity(`${tagComponent.getName()} (Clone)`);
        const clonedEntityTransform = clonedEntity.getComponent<TransformComponent>(ComponentType.TransformComponent);
        clonedEntityTransform.setPosition(position.x, position.y, 0);     
    }

    onCreate() {}
    onUpdate(deltaTime: number) {}
    onDestroy() {}

    // DONT INHERIT THESE METHODS
    onCreateSealed() {
        this.tag = this.getComponent<TagComponent>(ComponentType.TagComponent);
        this.transform = this.getComponent<TransformComponent>(ComponentType.TransformComponent);
    }
}
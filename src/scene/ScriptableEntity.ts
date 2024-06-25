import { Body2DComponent, CameraComponent, ComponentType, Entity, ShapeType, TagComponent, TransformComponent, Vec2 } from "../banana.js"

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

    getComponent<T>(componentType): T {
        return this.entity.getComponent(componentType);
    }

    instantiate(position: Vec2, flag: boolean = false) {
        const clonedEntity = this.entity.scene.createEntity('test');
        const clonedEntityTransform = clonedEntity.getComponent<TransformComponent>(ComponentType.TransformComponent);
        clonedEntityTransform.setPosition(position.x, position.y, 0);
        
        const body = clonedEntity.addComponent<Body2DComponent>(ComponentType.Body2DComponent);

        if (flag) {
            body.setShape(ShapeType.Circle);
            clonedEntity.addComponent(ComponentType.CircleRendererComponent);
        }
        else {
            clonedEntity.addComponent(ComponentType.SpriteRendererComponent);
        }        
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
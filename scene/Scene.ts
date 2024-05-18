import { ntt } from './ntt.js'
import { ComponentType } from '../core/Type.js'
import { Renderer2D } from '../render/Renderer2D.js'
import { Entity } from './Entity.js'
import { CameraComponent, 
         CircleRendererComponent, 
         Color, 
         Log, 
         NativeScriptComponent, 
         Body2DComponent, 
         SceneCamera, 
         SpriteRendererComponent, 
         TagComponent, 
         TransformComponent, 
         PhysicsWorld} from '../banana.js'
import { Mat4, Vec2, Vec3, Vec4 } from '../math/MV.js'
import { Collisions } from '../physics/Collisions.js'
import { ShapeType } from '../physics/Body.js'
 
export class Scene 
{
    registry: ntt;
    private _name: string;
    private _view: Mat4;

    constructor(name: string)
    {
        this.registry = new ntt();
        this._name = name;
        this._view = new Mat4();
    }

    public get name(): string {
        return this._name;
    }

    createEntity(name: string): Entity {
        const entity = new Entity(this.registry.create(), this);
        
        entity.addComponent(ComponentType.TransformComponent);
        const tag = entity.addComponent<TagComponent>(ComponentType.TagComponent);

        if (typeof name != 'undefined') {
            tag.setName(name);
        }

        return entity;
    }

    // entity is the entity object not the entity id.
    destroyEntity(entity: Entity) {
        if (!this.registry.valid(entity.entityHandle)) {
            Log.Core_Error('Cannot destroy a non-existing entity!');
            return false;
        }

        this.registry.release(entity.entityHandle);
        return true;
    }

    renderScene() {
        
        const sprites = this.registry.group(ComponentType.TransformComponent, ComponentType.SpriteRendererComponent);

        sprites.forEach(entity => {
            const transform = this.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            const sprite = this.registry.get<SpriteRendererComponent>(entity, ComponentType.SpriteRendererComponent);

            Renderer2D.drawColorQuad(transform, sprite.getColor());
        });
        
        const circles = this.registry.group(ComponentType.TransformComponent, ComponentType.CircleRendererComponent);

        circles.forEach(entity => {
            const transform = this.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            const circle = this.registry.get<CircleRendererComponent>(entity, ComponentType.CircleRendererComponent);

            Renderer2D.drawCircle(transform, circle.color, circle.thickness, circle.fade);
        });
    }

    onUpdateRuntime(deltaTime) {
        {
            // scriptable entities
            const nativeScripts = this.registry.get_all_with_entity<NativeScriptComponent>(ComponentType.NativeScriptComponent);
            
            for (const [entity, ns] of Object.entries(nativeScripts)) {
                if (!ns.Instance) 
                {
                    ns.Instance = ns.instanceScriptFn();
                    ns.Instance.entity = new Entity(entity, this);
                    ns.Instance.onCreateSealed();
                    ns.Instance.onCreate();
                }

                ns.Instance.onUpdate(deltaTime);
            }
        }

        let mainCamera: SceneCamera = null;
        let mainCameraTransform: TransformComponent = null;

        const cameraEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.CameraComponent);
        cameraEntities.forEach(cameraEntity => {
            const transform = this.registry.get(cameraEntity, ComponentType.TransformComponent) as TransformComponent;
            const camera = this.registry.get(cameraEntity, ComponentType.CameraComponent) as CameraComponent;

            if (camera.isPrimary()) 
            {
                mainCameraTransform = transform;
                mainCamera = camera.getCamera();
            }
        });


        if (!mainCamera) {
            return;
        }


        this._view.identity();
        this._view.setTranslation(mainCameraTransform.getPosition());
        this._view.applyRotationZ(mainCameraTransform.getRotation().z);

        Renderer2D.beginScene(mainCamera, this._view);

        this.renderScene();

        Renderer2D.endScene();

        {
            // physics
            const groupedEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.Body2DComponent);
            
            groupedEntities.forEach(entity => {
                const transformComponentA = this.registry.get(entity, ComponentType.TransformComponent) as TransformComponent;
                const bodyComponentA = this.registry.get(entity, ComponentType.Body2DComponent) as Body2DComponent;

                PhysicsWorld.update(bodyComponentA, transformComponentA);

                const entityIndex = groupedEntities.indexOf(entity);

                for (let i = entityIndex + 1; i < groupedEntities.length; i++) {
                    const transformComponentB = this.registry.get(groupedEntities[i], ComponentType.TransformComponent) as TransformComponent;
                    const bodyComponentB = this.registry.get(groupedEntities[i], ComponentType.Body2DComponent) as Body2DComponent;

                    if (bodyComponentA.body2d.shapeType == ShapeType.Circle || bodyComponentB.body2d.shapeType == ShapeType.Circle) {
                        const collInfo = Collisions.checkCircleCollision(
                            new Vec2(transformComponentA.getPosition().x, transformComponentA.getPosition().y),
                            bodyComponentA.radius,
                            new Vec2(transformComponentB.getPosition().x, transformComponentB.getPosition().y),
                            bodyComponentB.radius
                        );

                        bodyComponentA.moveBy(collInfo.normal.mul(collInfo.depth).div(-2), transformComponentA);
                        bodyComponentB.moveBy(collInfo.normal.mul(collInfo.depth).div(2), transformComponentB);
                    }

                    else if (bodyComponentA.body2d.shapeType == ShapeType.Box || bodyComponentB.body2d.shapeType == ShapeType.Box) {
                        const transformA = transformComponentA.getTransform();
                        const transformB = transformComponentB.getTransform();

                        const verticesA = [];
                        const verticesB = [];

                        for (let i = 0; i < 4; i++) {
                            verticesA.push(transformA.mulVec4(bodyComponentA.body2d.vertices[i]));
                            verticesB.push(transformB.mulVec4(bodyComponentB.body2d.vertices[i]));
                        }

                        const collInfo = Collisions.checkPolygonCollision(verticesA, verticesB);
                    }
                };
            });
        }
    }

    onUpdateEditor(deltaTime, editorCameraController) 
    {
        Renderer2D.beginScene(editorCameraController.getCamera());

        this.renderScene();

        Renderer2D.drawLine(new Vec3(100, 200, 0), new Vec3(-100, 200, 0), Color.RED);

        Renderer2D.drawRectangle(new Vec3(0, 0, 0), new Vec2(100, 100), Color.GREEN);
        Renderer2D.drawRectangle(new Vec3(0, 0, 0), new Vec2(200, 200), Color.BLUE);

        Renderer2D.endScene();
    }

    onEvent(event) 
    {
        const cameraComponents = this.registry.get_all<CameraComponent>(ComponentType.CameraComponent);

        cameraComponents.forEach(cc => {
            cc.getCamera().onEvent(event);
        });
    }
}
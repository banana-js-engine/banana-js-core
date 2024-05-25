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
 
export class Scene 
{
    registry: ntt;
    world: PhysicsWorld;
    physicsIterations: number;

    private _name: string;
    private _view: Mat4;

    constructor(name: string)
    {
        this.registry = new ntt();
        this.world = new PhysicsWorld();
        this._name = name;
        this._view = new Mat4();
        this.physicsIterations = 10;
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

        // DEBUG CODE
        // for (const contactPoint of PhysicsWorld.contactPoints) {
        //     const v1 = new Vec3(contactPoint.x, contactPoint.y, 0);
        //     Renderer2D.drawRectangle(v1, new Vec2(0.2, 0.2), Color.ORANGE);
        // }
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

        {
            // physics
            const groupedEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.Body2DComponent);
            
            //PhysicsWorld.contactPoints = [];

            for (let it = 0; it < this.physicsIterations; it++) {
                for (let i = 0; i < groupedEntities.length; i++) {
                    const transformComponentA = this.registry.get<TransformComponent>(groupedEntities[i], ComponentType.TransformComponent);
                    const bodyComponentA = this.registry.get<Body2DComponent>(groupedEntities[i], ComponentType.Body2DComponent);
    
                    this.world.update(deltaTime, bodyComponentA, transformComponentA, this.physicsIterations);
                };
                
                for (let i = 0; i < groupedEntities.length; i++) {
                    const transformComponentA = this.registry.get<TransformComponent>(groupedEntities[i], ComponentType.TransformComponent);
                    const bodyComponentA = this.registry.get<Body2DComponent>(groupedEntities[i], ComponentType.Body2DComponent);
                    
                    for (let j = i + 1; j < groupedEntities.length; j++) {
                        const transformComponentB = this.registry.get<TransformComponent>(groupedEntities[j], ComponentType.TransformComponent);
                        const bodyComponentB = this.registry.get<Body2DComponent>(groupedEntities[j], ComponentType.Body2DComponent);
    
                        this.world.collide(deltaTime, bodyComponentA, transformComponentA, bodyComponentB, transformComponentB, this.physicsIterations);
                    };
                };
            }
        }

        let mainCamera: SceneCamera = null;
        let mainCameraTransform: TransformComponent = null;

        const cameraEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.CameraComponent);
        cameraEntities.forEach(cameraEntity => {
            const transform = this.registry.get<TransformComponent>(cameraEntity, ComponentType.TransformComponent);
            const camera = this.registry.get<CameraComponent>(cameraEntity, ComponentType.CameraComponent);

            if (camera.isPrimary) {
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
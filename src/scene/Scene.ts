import { ntt } from './ntt.js'
import { ComponentType } from '../core/Type.js'
import { Renderer2D } from '../render/Renderer2D.js'
import { Entity } from './Entity.js'
import { Mat4, Vec2 } from '../math/BananaMath.js'
import { PhysicsWorld } from '../physics/PhysicsWorld.js'
import { SceneCamera } from '../render/Camera.js'
import { Log } from '../core/Log.js'
import { EditorCameraController } from '../core/CameraController.js'
import { Event } from '../event/Event.js'
import { Color } from '../render/Color.js'
import { CameraComponent, 
         CircleRendererComponent, 
         NativeScriptComponent, 
         Body2DComponent, 
         SpriteRendererComponent, 
         TagComponent, 
         TransformComponent, 
         TextRendererComponent,
         AudioComponent,
         WindowComponent} from '../scene/Component.js'
import { ShapeType } from '../physics/Body2D.js'



export class Scene {
    registry: ntt;
    world: PhysicsWorld;
    
    #name: string;
    #view: Mat4;
    #tempTransform: TransformComponent;
    #physicsIterations: number;
    #windowsOpened: boolean;

    constructor(name: string) {
        this.registry = new ntt();
        this.world = new PhysicsWorld();
        this.#name = name;
        this.#view = new Mat4();
        this.#physicsIterations = 10;
        this.#tempTransform = new TransformComponent();
        this.#windowsOpened = false;
    }

    get name(): string {
        return this.#name;
    }

    set name(newName: string) {
        this.#name = newName;
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

    renderScene(deltaTime: number) {

        const sprites = this.registry.group(ComponentType.TransformComponent, ComponentType.SpriteRendererComponent);

        sprites.forEach(entity => {
            const transform = this.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            const spriteRenderer = this.registry.get<SpriteRendererComponent>(entity, ComponentType.SpriteRendererComponent);

            if (spriteRenderer.getSprite()) {
                Renderer2D.drawTextureQuad(transform, spriteRenderer.getSprite(), spriteRenderer.getColor());
            }
            else {
                Renderer2D.drawColorQuad(transform, spriteRenderer.getColor());
            }
        });
        
        const circles = this.registry.group(ComponentType.TransformComponent, ComponentType.CircleRendererComponent);

        circles.forEach(entity => {
            const transform = this.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            const circle = this.registry.get<CircleRendererComponent>(entity, ComponentType.CircleRendererComponent);

            Renderer2D.drawCircle(transform, circle.color, circle.thickness, circle.fade);
        });

        const texts = this.registry.group(ComponentType.TransformComponent, ComponentType.TextRendererComponent);

        texts.forEach(entity => {
            const transform = this.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            const textRenderer = this.registry.get<TextRendererComponent>(entity, ComponentType.TextRendererComponent);

            Renderer2D.drawText(transform, textRenderer.text);
        })

        // DEBUG CODE
        // for (const contactPoint of PhysicsWorld.contactPoints) {
        //     const v1 = new Vec3(contactPoint.x, contactPoint.y, 0);
        //     Renderer2D.drawRectangle(v1, new Vec2(0.2, 0.2), Color.ORANGE);
        // }
    }

    renderEditor(deltaTime: number, windowAspectRatio: number) {

        // Render camera boundaries
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

        if (mainCamera) {
            const cameraSize = new Vec2(mainCamera.size * windowAspectRatio, mainCamera.size);

            Renderer2D.drawRectangle(mainCameraTransform.getPosition(), cameraSize, Color.BLUE);
        }

        // Render body2d boundaries
        const bodyEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.Body2DComponent);
        bodyEntities.forEach(bodyEntity => {
            const transform = this.registry.get<TransformComponent>(bodyEntity, ComponentType.TransformComponent);
            const body2d = this.registry.get<Body2DComponent>(bodyEntity, ComponentType.Body2DComponent);

            if (body2d.body2d.shapeType == ShapeType.Box) {

                // render rectangular boundary
                const scale = transform.getScale();
                const bodySize = new Vec2(body2d.body2d.width * scale.x, body2d.body2d.height * scale.y);

                Renderer2D.drawRectangle(transform.getPosition(), bodySize, Color.GREEN);
            }
            else if (body2d.body2d.shapeType == ShapeType.Circle) {
                
                // render circular boundary
                const originalScale = transform.getScale();
                const radiusScale = body2d.body2d.radius * 2;
                

                // #tempTransform is needed because we need to account for body2d's radius property in the scale.
                this.#tempTransform.setPosition( transform.getPosition() );
                this.#tempTransform.setRotation( transform.getRotation() );
                this.#tempTransform.setScale( originalScale.x * radiusScale, originalScale.y * radiusScale, originalScale.z );

                Renderer2D.drawCircle(this.#tempTransform, Color.GREEN, 0.02, 0);
            }
        })
    }

    onUpdateRuntime(deltaTime: number) {
        
        const windowComponents = this.registry.get_all<WindowComponent>(ComponentType.WindowComponent);
        {
            // multi-window logic
            
            if (!this.#windowsOpened) { 
                for (const windowComponent of windowComponents) {
                    windowComponent.open();
                }
            }
    
            this.#windowsOpened = true;
        }

        {
            // scriptable entities
            const nativeScripts = this.registry.get_all_with_entity<NativeScriptComponent>(ComponentType.NativeScriptComponent);
            
            for (const [entity, ns] of Object.entries(nativeScripts)) {
                if (ns.instanceScriptFn) {
                    if (!ns.Instance) {
                        ns.Instance = ns.instanceScriptFn();
                        ns.Instance.entity = new Entity(entity, this);
                        ns.deserialize();
                        ns.Instance.onCreateSealed();
                        ns.Instance.onCreate();
                    }

                    ns.Instance.onUpdate(deltaTime);
                }

            }
        }

        {
            // physics
            const groupedEntities = this.registry.group(ComponentType.TransformComponent, ComponentType.Body2DComponent);
            
            //PhysicsWorld.contactPoints = [];

            // TODO: SHOULD BE IMPROVED
            for (let it = 0; it < this.#physicsIterations; it++) {
                for (let i = 0; i < groupedEntities.length; i++) {
                    const transformComponentA = this.registry.get<TransformComponent>(groupedEntities[i], ComponentType.TransformComponent);
                    const bodyComponentA = this.registry.get<Body2DComponent>(groupedEntities[i], ComponentType.Body2DComponent);
    
                    this.world.update(deltaTime, bodyComponentA, transformComponentA, this.#physicsIterations);
                };
                
                for (let i = 0; i < groupedEntities.length; i++) {
                    const transformComponentA = this.registry.get<TransformComponent>(groupedEntities[i], ComponentType.TransformComponent);
                    const bodyComponentA = this.registry.get<Body2DComponent>(groupedEntities[i], ComponentType.Body2DComponent);
                    
                    for (let j = i + 1; j < groupedEntities.length; j++) {
                        const transformComponentB = this.registry.get<TransformComponent>(groupedEntities[j], ComponentType.TransformComponent);
                        const bodyComponentB = this.registry.get<Body2DComponent>(groupedEntities[j], ComponentType.Body2DComponent);
    
                        this.world.collide(deltaTime, bodyComponentA, transformComponentA, bodyComponentB, transformComponentB, this.#physicsIterations);
                    };
                };
            }
        }

        // audio
        let audioComponents = this.registry.get_all<AudioComponent>(ComponentType.AudioComponent);

        for (const audioComponent of audioComponents) {
            if (audioComponent.playOnStart) {
                audioComponent.playOnStart = false;
                audioComponent.play();
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

        for (const windowComponent of windowComponents) {
            windowComponent.clear(mainCamera.clearColor);
        }

        this.#view.identity();
        this.#view.setTranslation(mainCameraTransform.getPosition());
        this.#view.applyRotationZ(mainCameraTransform.getRotation().z);

        Renderer2D.beginScene(mainCamera, this.#view);

        this.renderScene(deltaTime);

        Renderer2D.endScene();
    }

    onUpdateEditor(deltaTime: number, editorCameraController: EditorCameraController, windowAspectRatio: number) 
    {
        Renderer2D.beginScene(editorCameraController.getCamera());

        this.renderScene(deltaTime);

        this.renderEditor(deltaTime, windowAspectRatio);

        Renderer2D.endScene();
    }

    onEvent(event: Event) 
    {
        const cameraComponents = this.registry.get_all<CameraComponent>(ComponentType.CameraComponent);

        cameraComponents.forEach(cameraComponent => {
            cameraComponent.getCamera().onEvent(event);
        });

        const windowComponents = this.registry.get_all<WindowComponent>(ComponentType.WindowComponent);

        windowComponents.forEach(windowComponent => {
            windowComponent.onEvent(event);
        });
    }
}
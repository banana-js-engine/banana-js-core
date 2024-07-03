import { AudioManager } from "../core/Audio.js";
import { CameraType } from "../render/Camera.js";
import { Color } from "../render/Color.js";
import { Texture } from "../render/Texture.js";
import { ShapeType } from "../physics/Body2D.js";
import { Vec3, Vec4 } from "../math/BananaMath.js";
import { Writer } from "../core/FileManager.js";
import { ComponentType } from "../core/Type.js";
import { AudioComponent, Body2DComponent, CameraComponent, CircleRendererComponent, NativeScriptComponent, SpriteRendererComponent, TagComponent, TextRendererComponent, TransformComponent } from "./Component.js";
import { Entity } from "./Entity.js";
import { Scene } from "./Scene.js";
import { ScriptableEntity } from "../script/ScriptableEntity.js";
import { ScriptManager, SupportedType } from "../script/ScriptManager.js";

export class SceneSerializer {
    static save(scene: Scene) {
        const sceneData = this.serialize(scene);

        Writer.saveStringAsFile(sceneData, `${scene.name}.banana`)
    }

    static serialize(scene: Scene): string {

        let sceneData: string = '';

        sceneData += `Scene: ${scene.name}\n`;
        sceneData += `Entities:\n`;

        const entities = scene.registry.get_all_entities();

        for (const entity of entities) {
            sceneData += ` - Entity: ${entity}\n`;

            // tag component
            const tagComponent = scene.registry.get<TagComponent>(entity, ComponentType.TagComponent);
            sceneData += `${tagComponent}`;

            // transform component
            const transformComponent = scene.registry.get<TransformComponent>(entity, ComponentType.TransformComponent);
            sceneData += `${transformComponent}`;

            if (scene.registry.has(entity, ComponentType.SpriteRendererComponent)) {
                const spriteRendererComponent = scene.registry.get<SpriteRendererComponent>(entity, ComponentType.SpriteRendererComponent);
                sceneData += `${spriteRendererComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.CircleRendererComponent)) {
                const circleRendererComponent = scene.registry.get<CircleRendererComponent>(entity, ComponentType.CircleRendererComponent);
                sceneData += `${circleRendererComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.TextRendererComponent)) {
                const textRendererComponent = scene.registry.get<TextRendererComponent>(entity, ComponentType.TextRendererComponent);
                sceneData += `${textRendererComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.CameraComponent)) {
                const cameraComponent = scene.registry.get<CameraComponent>(entity, ComponentType.CameraComponent);
                sceneData += `${cameraComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.NativeScriptComponent)) {
                const scriptComponent = scene.registry.get<NativeScriptComponent>(entity, ComponentType.NativeScriptComponent);
                sceneData += `${scriptComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.Body2DComponent)) {
                const body2dComponent = scene.registry.get<Body2DComponent>(entity, ComponentType.Body2DComponent);
                sceneData += `${body2dComponent}`;
            }

            if (scene.registry.has(entity, ComponentType.AudioComponent)) {
                const audioComponent = scene.registry.get<AudioComponent>(entity, ComponentType.AudioComponent);
                sceneData += `${audioComponent}`;
            }
        }

        return sceneData;
    }

    static deserialize(sceneData: string): Scene {
        let scene: Scene | null = null;
        let currentEntity: Entity | null = null;

        let lines = sceneData.split('\n');
    
        for (let i = 0; i < lines.length; i++) {

            if (lines[i].startsWith('Scene:')) {
                const sceneName = lines[i].split(':')[1].trim();
                scene = new Scene(sceneName);
            } 
            else if (lines[i].startsWith(' - Entity:')) {
                const entityId = lines[i].split(':')[1].trim();
                currentEntity = new Entity(scene.registry.create_with_id(entityId), scene);
            } 
            else if (lines[i].startsWith('TagComponent:')) {
                const tagComponent = currentEntity.addComponent<TagComponent>(ComponentType.TagComponent);
                const tag = lines[i+1].split(':')[1].trim();
                tagComponent.setName(tag);
            } 
            else if (lines[i].startsWith('TransformComponent:')) {
                const transformComponent = currentEntity.addComponent<TransformComponent>(ComponentType.TransformComponent);
                const positionString = lines[i+1].split(':')[1].trim();
                const rotationString = lines[i+2].split(':')[1].trim();
                const scaleString = lines[i+3].split(':')[1].trim();

                const position = this.parseVec3(positionString);
                const rotation = this.parseVec3(rotationString);
                const scale = this.parseVec3(scaleString);

                transformComponent.setPosition(position.x, position.y, position.z);
                transformComponent.setRotation(rotation.x, rotation.y, rotation.z);
                transformComponent.setScale(scale.x, scale.y, scale.y);
            }
            else if (lines[i].startsWith('SpriteRendererComponent:')) {
                const spriteRendererComponent = currentEntity.addComponent<SpriteRendererComponent>(ComponentType.SpriteRendererComponent);

                const colorString = lines[i+1].split(':')[1].trim();
                const sprite = lines[i+2].split('Texture:')[1].trim();

                const color = this.parseVec4(colorString);

                spriteRendererComponent.setColor(new Color(color.x, color.y, color.z, color.w));

                if (sprite != 'None') {
                    spriteRendererComponent.setSprite(new Texture(sprite));
                }
            }
            else if (lines[i].startsWith('CircleRendererComponent:')) {
                const circleRendererComponent = currentEntity.addComponent<CircleRendererComponent>(ComponentType.CircleRendererComponent);

                const colorString = lines[i+1].split(':')[1].trim();
                const thicknessString = lines[i+2].split(':')[1].trim();
                const fadeString = lines[i+3].split(':')[1].trim();

                const color = this.parseVec4(colorString);
                const thickness = parseFloat(thicknessString);
                const fade = parseFloat(fadeString);

                circleRendererComponent.color = new Color(color.x, color.y, color.z, color.w);
                circleRendererComponent.thickness = thickness;
                circleRendererComponent.fade = fade;
            }
            else if (lines[i].startsWith('TextRendererComponent:')) {
                const textRendererComponent = currentEntity.addComponent<TextRendererComponent>(ComponentType.TextRendererComponent);

                const text = lines[i+1].split(':')[1].trim();

                textRendererComponent.setText(text);
            }
            else if (lines[i].startsWith('CameraComponent:')) {
                const cameraComponent = currentEntity.addComponent<CameraComponent>(ComponentType.CameraComponent);

                const type = parseInt(lines[i+2].split(':')[1].trim()) as CameraType;
                const fovy = parseFloat(lines[i+3].split(':')[1].trim());
                const perspectiveNear = parseFloat(lines[i+4].split(':')[1].trim());
                const perspectiveFar = parseFloat(lines[i+5].split(':')[1].trim());
                const size = parseFloat(lines[i+6].split(':')[1].trim());
                const orthographicNear = parseFloat(lines[i+7].split(':')[1].trim());
                const orthographicFar = parseFloat(lines[i+8].split(':')[1].trim());
                const primary = lines[i+9].split(':')[1].trim() == 'true';
                const clearColorString = lines[i+10].split(':')[1].trim();

                cameraComponent.sceneCamera.cameraType = type;
                cameraComponent.sceneCamera.fovy = fovy;
                cameraComponent.sceneCamera.perspectiveNear = perspectiveNear;
                cameraComponent.sceneCamera.perspectiveFar = perspectiveFar;
                cameraComponent.sceneCamera.size = size;
                cameraComponent.sceneCamera.orthographicNear = orthographicNear;
                cameraComponent.sceneCamera.orthographicFar = orthographicFar;
                cameraComponent.isPrimary = primary;

                const clearColor = this.parseVec4(clearColorString);

                cameraComponent.sceneCamera.clearColor = new Color(clearColor.x, clearColor.y, clearColor.z, clearColor.w);

                cameraComponent.sceneCamera.setViewportSize();
            }
            else if (lines[i].startsWith('NativeScriptComponent')) {
                const scriptComponent = currentEntity.addComponent<NativeScriptComponent>(ComponentType.NativeScriptComponent);

                const src = lines[i+1].split(':')[1].trim();

                scriptComponent.src = src;

                import(src).then(module => {

                    scriptComponent.bind(Object.values(module)[0] as { new(): ScriptableEntity });
                    ScriptManager.mockCreateInEditor(scriptComponent, currentEntity.entityHandle, scene);

                    const properties = Object.entries(scriptComponent.Instance);
                    for (let j = 1; j < properties.length; j++) {
                        let value: SupportedType = properties[j][1];

                        // skip unsupported types
                        if (!ScriptManager.isSupportedType(value)) {
                            continue;
                        }

                        // Source is (i+1)th line, 
                        // since j starts from 1, we start counting lines from i+j+1 
                        const serializedValue = lines[i+j+1].split(':')[1].trim();
                        const propertyName = properties[j][0];
                    
                        ScriptManager.deserializeProperties(scriptComponent, value, serializedValue, propertyName);
                    }

                    // this line is needed: see Scene.ts, line 177
                    // never falls in that if statement when the game starts.
                    // also cannot call resetMockCreation here, because we need to preserve properties.
                    scriptComponent.Instance = null;
                });
            }
            else if (lines[i].startsWith('Body2DComponent:')) {
                const body2dComponent = currentEntity.addComponent<Body2DComponent>(ComponentType.Body2DComponent);

                const type = parseInt(lines[i+1].split(':')[1].trim()) as ShapeType;
                const width = parseFloat(lines[i+2].split(':')[1].trim());
                const height = parseFloat(lines[i+3].split(':')[1].trim());
                const radius = parseFloat(lines[i+4].split(':')[1].trim());
                const density = parseFloat(lines[i+5].split(':')[1].trim());
                const isStatic = lines[i+6].split(':')[1].trim() == '1'
                const restitution = parseFloat(lines[i+7].split(':')[1].trim());
                const gravityScale = parseFloat(lines[i+8].split(':')[1].trim());

                body2dComponent.width = width;
                body2dComponent.height = height;
                body2dComponent.radius = radius;
                body2dComponent.density = density;
                body2dComponent.isStatic = isStatic;
                body2dComponent.restitution = restitution;
                
                body2dComponent.setShape(type);
                
                body2dComponent.gravityScale = gravityScale;
            }
            else if (lines[i].startsWith('AudioComponent:')) {
                const audioComponent = currentEntity.addComponent<AudioComponent>(ComponentType.AudioComponent);

                const audioSource = lines[i+1].split(':')[1].trim();
                const playOnStart = lines[i+2].split(':')[1].trim() == '1';
                const loop = lines[i+3].split(':')[1].trim() == '1';
                const volume = parseFloat(lines[i+4].split(':')[1].trim());

                AudioManager.loadAudio(audioSource)
                .then(buffer => {
                    audioComponent.setAudio( AudioManager.createSource(buffer) );
                    audioComponent.playOnStart = playOnStart;
                    audioComponent.loop = loop;
                    audioComponent.volume = volume;
                    audioComponent.src = audioSource;
                    audioComponent.name = audioSource.substring(audioSource.lastIndexOf('/') + 1);
                })
            }
        }
    
        return scene;
    }

    static parseVec3(text: string): Vec3 {
        if (text.startsWith('[') && text.endsWith(']')) {
            const numbersString = text.substring(1, text.length - 1).split(',');

            if (numbersString.length === 3) {
                const numbers = numbersString.map(num => parseFloat(num.trim()));

                return new Vec3(numbers[0], numbers[1], numbers[2]);
            }
        }

        return null;
    }

    static parseVec4(text: string): Vec4 {
        if (text.startsWith('[') && text.endsWith(']')) {
            const numbersString = text.substring(1, text.length - 1).split(',');

            if (numbersString.length === 4) {
                const numbers = numbersString.map(num => parseFloat(num.trim()));

                return new Vec4(numbers[0], numbers[1], numbers[2], numbers[3]);
            }
        }

        return null;
    }
}
import { NativeScriptComponent } from '../scene/Component.js';
import { Scene } from '../scene/Scene.js';
import { Entity } from '../scene/Entity.js'
import { ImGui } from '../core/EntryPoint.js';

/*
TODO: Support component referencing
TODO: Support ScriptableEntity referencing
Currently supported types:
*/
export type SupportedType = number | string | boolean;

export class ScriptManager {

    /**
     * Supported types for serialization of properties in scripts.
     */
    static supportedTypes = ['number', 'string', 'boolean'];

    /**
     * Mock-initialization of a script.
     * What mock means here: Scripts are meant to be only initialized when the game is ran.
     * However, to be able to fetch properties they need to be "initialized" in the editor as well.
     * @param scriptComponent script component to mock-create
     * @param handle id handle of the entity which the script component belongs to.
     * @param scene the scene where the entity belongs to.
     */
    static mockCreateInEditor(scriptComponent: NativeScriptComponent, handle: string, scene: Scene) {
        scriptComponent.Instance = scriptComponent.instanceScriptFn();
        scriptComponent.Instance.entity = new Entity(handle, scene);
        scriptComponent.Instance.onCreate();
        scriptComponent.createdInEditor = true;
    }

    /**
     * A wrapper function for the createdInEditor property of NativeScriptComponent.
     */
    static isMockCreated(scriptComponent: NativeScriptComponent) {
        return scriptComponent.createdInEditor;
    }

    /**
     * This function resets the mock creation, in case the script source is changed in the editor.
     */
    static resetMockCreation(scriptComponent: NativeScriptComponent) {
        scriptComponent.Instance = null;
        scriptComponent.properties = {};
        scriptComponent.createdInEditor = false;
    }

    /**
     * Finds the primitive properties, (defined in supportedTypes) and adds them to a structure.
     * @param scriptComponent script for which the primitive properties will be found and added.
     */
    static addPrimitiveProperties(scriptComponent: NativeScriptComponent) {
        const properties = Object.entries(scriptComponent.Instance);
        for (let i = 1; i < properties.length; i++) {
            if (this.isSupportedType(properties[i][1])) {
                scriptComponent.addProperty(properties[i][0], properties[i][1]);
            }
        }
    }

    /**
     * Serializes properties by turning them into ImGui fields.
     * @param scriptComponent script to serialize properties.
     */
    static serializeProperties(scriptComponent: NativeScriptComponent) {
        for (let [name, value] of Object.entries(scriptComponent.properties)) {
            if (typeof value == 'number') {
                ImGui.InputInt(name, (v = value) => scriptComponent.properties[name] = v);
            }
            else if (typeof value == 'string') {
                ImGui.InputText(name, (v = value) => scriptComponent.properties[name] = v);
            }
            else if (typeof value == 'boolean') {
                ImGui.Checkbox(name, (v = value) => scriptComponent.properties[name] = v)
            }
            else if (typeof value == 'undefined') {
                ImGui.Text(`${name} is undefined, must be initialized`);
            }
        }
    }

    /**
     * Reads values from serialized scene data and converts them in to properties.
     */
    static deserializeProperties(scriptComponent: NativeScriptComponent, originalValue, serializedValue, propertyName: string) {
        if (!this.isSupportedType(originalValue)) {
            return;
        }

        let actualValue: SupportedType;
        if (typeof originalValue == 'number') {
            actualValue = parseFloat(serializedValue);
        }
        else if (originalValue == 'string') {
            actualValue = serializedValue
        }
        else if (originalValue == 'boolean') {
            actualValue = serializedValue == 'true';
        }

        scriptComponent.addProperty(propertyName, actualValue);
    }

    /**
     * Checks whether the give value is valid for serialization.
     * @param value is the value to support test.
     * @returns whether the value is supported for serialization.
     */
    static isSupportedType(value: any): boolean {
        return this.supportedTypes.includes(typeof value);
    }
}
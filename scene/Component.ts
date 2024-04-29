import { Color } from '../render/Color.ts'
import { ComponentType } from '../core/Type.ts'
import { SceneCamera } from '../render/Camera.ts'
import { Movement } from './Movement.ts'
import RigidBody2D from '../physics/RigidBody2D.ts'
import { Mat4, Vec3 } from '../math/MV.ts'
import { ScriptableEntity } from './ScriptableEntity.ts'

export class Component {
    type: ComponentType;
}

export class TagComponent extends Component {

    name: string;

    constructor() {
        super();

        this.name = 'Banana';

        this.type = ComponentType.TagComponent
    }

    setName(name: string) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    toString() {
        return `TagComponent:\n  Tag: ${this.name}\n`;
    }
}

export class TransformComponent extends Component {

    transform: Mat4;
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    constructor() {
        super();
        this.transform = new Mat4();
        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3(0, 0, 0);
        this.scale = new Vec3(1, 1, 1);

        this.type = ComponentType.TransformComponent;
    }

    getTransform(): Mat4 {
        this.transform.setTranslation(this.position);
        this.transform.applyRotationZ(this.rotation.z);
        this.transform.applyScale(this.scale);

        return this.transform;
    }

    getPosition(): Vec3 {
        return this.position;
    }

    setPosition(x: number, y: number, z: number) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    translate(x: number, y: number, z: number) {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
    }

    getRotation(): Vec3 {
        return this.rotation;
    }

    setRotation(angleX, angleY, angleZ) {
        this.rotation.x = angleX;
        this.rotation.y = angleY;
        this.rotation.z = angleZ;
    }

    rotate(angleX, angleY, angleZ) {
        this.rotation.x += angleX;
        this.rotation.y += angleY;
        this.rotation.z += angleZ;
    }

    getScale() {
        return this.scale;
    }

    setScale(x, y, z) {
        this.scale.x = x;
        this.scale.y = y;
        this.scale.z = z;
    }

    toString() {

        const position = `Position: ${this.getPosition()}`;
        const rotation = `Rotation: ${this.getRotation()}`;
        const scale = `Scale: ${this.getScale()}`;

        return `TransformComponent:\n  ${position}\n  ${rotation}\n  ${scale}\n`;
    }
}

export class SpriteRendererComponent extends Component {
    
    color: Color;
    
    constructor() {
        super();
        this.color = Color.WHITE;

        this.type = ComponentType.SpriteRendererComponent;
    }

    setColor(color: Color) {
        this.color = color;
    }

    getColor(): Color {
        return this.color;
    }

    toString() {
        return `SpriteRendererComponent:\n  Color: ${this.color}`
    }
}

export class CircleRendererComponent extends Component {

    private _color: Color;
    private _thickness: number;
    private _fade: number;

    constructor() {
        super();
        this._color = Color.WHITE;
        this._thickness = 1.0;
        this._fade = 0.0;

        this.type = ComponentType.CircleRendererComponent;
    }

    public get color() {
        return this._color;
    }

    public set color(newColor) {
        this._color = newColor;
    }

    public get thickness() {
        return this._thickness;
    }

    public set thickness(newThickness) {
        this._thickness = newThickness;
    }

    public get fade() {
        return this._fade;
    }

    public set fade(newFade) {
        this._fade = newFade;
    }
}

export class CameraComponent extends Component {

    sceneCamera: SceneCamera;
    primary: boolean

    constructor() {
        super();
        this.sceneCamera = new SceneCamera();

        this.primary = true;

        this.type = ComponentType.CameraComponent;
    }

    isPrimary(): boolean {
        return this.primary;
    }

    setPrimary(flag: boolean) {
        this.primary = flag;
    }

    getCamera(): SceneCamera {
        return this.sceneCamera;
    }

    getType() {
        return this.sceneCamera.getCameraType();
    }

    toString() {
        const type = `ProjectionType: ${this.getType().valueOf()}`;

        const fov = `ProjectionFOV: ${this.getCamera().fovy}`;
        const pNear = `PerspectiveNear: ${this.getCamera().perspectiveNear}`;
        const pFar = `PerspectiveFar: ${this.getCamera().perspectiveFar}`;

        const size = `OrthographicSize: ${this.getCamera().size}`;
        const oNear = `OrthographicNear: ${this.getCamera().orthographicNear}`;
        const oFar = `OrthographicFar: ${this.getCamera().orthographicFar}`;
        
        const primary = `Primary: ${this.isPrimary()}`;

        return `CameraComponent:\n  Camera:\n   ${type}\n   ${fov}\n   ${pNear}\n   ${pFar}\n   ${size}\n   ${oNear}\n   ${oFar}\n  ${primary}\n`;
    }
}

export class NativeScriptComponent extends Component {

    Instance: ScriptableEntity;
    instanceScriptFn: Function;
    destroyScriptFn: Function;

    constructor() {
        super();
        this.Instance = null;
        this.instanceScriptFn = function() {}
        this.destroyScriptFn = function(nativeScriptComponent: NativeScriptComponent) {}

        this.type = ComponentType.NativeScriptComponent;
    }

    bind(scriptableEntityClass: { new(): ScriptableEntity }) {
        this.instanceScriptFn = function() { return new scriptableEntityClass(); }
        this.destroyScriptFn = function(nativeScriptComponent: NativeScriptComponent) { nativeScriptComponent.Instance = null; }
    }
}

export class MovementComponent extends NativeScriptComponent {
    constructor() {
        super();
        
        this.bind(Movement);
    }
}

// PHYSICS-RELATED COMPONENTS
export class RigidBody2DComponent extends Component {

    rigidBody2D: RigidBody2D;

    constructor() {
        super();
        this.rigidBody2D = new RigidBody2D();

        this.type = ComponentType.RigidBody2DComponent;
    }
}

export const ComponentCreator = {}
ComponentCreator[ComponentType.TagComponent] = TagComponent;
ComponentCreator[ComponentType.TransformComponent] = TransformComponent;
ComponentCreator[ComponentType.SpriteRendererComponent] = SpriteRendererComponent;
ComponentCreator[ComponentType.CircleRendererComponent] = CircleRendererComponent;
ComponentCreator[ComponentType.CameraComponent] = CameraComponent;
ComponentCreator[ComponentType.NativeScriptComponent] = NativeScriptComponent;
ComponentCreator[ComponentType.MovementComponent] = MovementComponent;
ComponentCreator[ComponentType.RigidBody2DComponent] = RigidBody2DComponent;
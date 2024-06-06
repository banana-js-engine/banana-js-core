import { Color } from '../render/Color.js'
import { ComponentType } from '../core/Type.js'
import { SceneCamera } from '../render/Camera.js'
import { Movement } from './Movement.js'
import { Mat4, Vec2, Vec3 } from '../math/BananaMath.js'
import { ScriptableEntity } from './ScriptableEntity.js'
import { Body2D, ShapeType } from '../physics/Body2D.js'
import { Scene } from './Scene.js'

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
    positionMat: Mat4;
    rotationMat: Mat4;
    scaleMat: Mat4;
    
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    constructor() {
        super();
        this.transform = new Mat4();
        this.positionMat = new Mat4();
        this.rotationMat = new Mat4();
        this.scaleMat = new Mat4();

        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3(0, 0, 0);
        this.scale = new Vec3(1, 1, 1);

        this.type = ComponentType.TransformComponent;
    }

    getTransform(): Mat4 {
        this.positionMat.setTranslation(this.position);
        this.rotationMat.setRotationZ(this.rotation.z);
        this.scaleMat.setScale(this.scale);

        this.transform.identity();
        this.transform.mul(this.scaleMat);
        this.transform.mul(this.rotationMat);
        this.transform.mul(this.positionMat);

        return this.transform;
    }

    getPosition(): Vec3 {
        return this.position;
    }

    setPosition(x: number | Vec3, y?: number, z?: number) {

        if (x instanceof Vec3) {
            this.position.x = x.x;
            this.position.y = x.y;
            this.position.z = x.z;
            return;
        }

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

    setRotation(angleX: number | Vec3, angleY?: number, angleZ?: number) {

        if (angleX instanceof Vec3) {
            this.rotation.x = angleX.x;
            this.rotation.y = angleX.y;
            this.rotation.z = angleX.z;
            return;
        }

        this.rotation.x = angleX;
        this.rotation.y = angleY;
        this.rotation.z = angleZ;

    }

    rotate(angleX: number, angleY: number, angleZ: number) {
        this.rotation.x += angleX;
        this.rotation.y += angleY;
        this.rotation.z += angleZ;
    }

    getScale() {
        return this.scale;
    }

    setScale(x: number | Vec3, y?: number, z?: number) {

        if (x instanceof Vec3) {
            this.scale.x = x.x;
            this.scale.y = x.y;
            this.scale.z = x.z;
            return;
        }

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
        return `SpriteRendererComponent:\n  Color: ${this.color}\n`
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

export class TextRendererComponent extends Component {
    text: string;

    constructor() {
        super();
        this.text = '';

        this.type = ComponentType.TextRendererComponent;
    }

    setText(text: string) {
        this.text = text;
    }
}

export class CameraComponent extends Component {

    private _isPrimary: boolean
    sceneCamera: SceneCamera;

    constructor() {
        super();
        this.sceneCamera = new SceneCamera();

        this.isPrimary = true;

        this.type = ComponentType.CameraComponent;
    }

    get isPrimary(): boolean {
        return this._isPrimary;
    }

    set isPrimary(flag: boolean) {
        this._isPrimary = flag;
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
        
        const primary = `Primary: ${this.isPrimary}`;

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
export class Body2DComponent extends Component {

    body2d: Body2D;

    constructor() {
        super();

        this.body2d = Body2D.CreateBoxBody2D(1, 1, 1, false, 0.1);

        this.type = ComponentType.Body2DComponent;
    }

    public update(deltaTime: number, transform: TransformComponent, gravity: Vec2, iterations: number) {
        this.body2d.update(deltaTime, transform, gravity, iterations);
    }

    public moveBy(v: Vec2, transform: TransformComponent) {
        this.body2d.moveBy(v, transform);
    }

    public addForce(amount: Vec2) {
        this.body2d.addForce(amount);
    }

    public get radius() {
        return this.body2d.radius;
    }

    public get linearVelocity() {
        return this.body2d.linearVelocity;
    }

    public set linearVelocity(v: Vec2) {
        this.body2d.linearVelocity = v;
    }

    public set gravityScale(newValue: number) {
        this.body2d.gravityScale = newValue;
    }
    
    public setShape(shapeType: ShapeType) {
        this.body2d.shapeType = shapeType;
        if (shapeType == ShapeType.Circle) {
            this.body2d = Body2D.CreateCircleBody2D(0.5, 1, false, 0.1);
        }
        else {
            this.body2d = Body2D.CreateBoxBody2D(1, 1, 1, false, 0.1);
        }
    }
}

export const ComponentCreator = {}
ComponentCreator[ComponentType.TagComponent] = TagComponent;
ComponentCreator[ComponentType.TransformComponent] = TransformComponent;
ComponentCreator[ComponentType.SpriteRendererComponent] = SpriteRendererComponent;
ComponentCreator[ComponentType.CircleRendererComponent] = CircleRendererComponent;
ComponentCreator[ComponentType.TextRendererComponent] = TextRendererComponent;
ComponentCreator[ComponentType.CameraComponent] = CameraComponent;
ComponentCreator[ComponentType.NativeScriptComponent] = NativeScriptComponent;
ComponentCreator[ComponentType.MovementComponent] = MovementComponent;
ComponentCreator[ComponentType.Body2DComponent] = Body2DComponent;
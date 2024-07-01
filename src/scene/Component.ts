import { Color } from '../render/Color.js'
import { ComponentType } from '../core/Type.js'
import { SceneCamera } from '../render/Camera.js'
import { Mat4, Vec2, Vec3 } from '../math/BananaMath.js'
import { ScriptableEntity } from '../script/ScriptableEntity.js'
import { Body2D, ShapeType } from '../physics/Body2D.js'
import { Texture } from '../render/Texture.js'
import { Audio } from '../core/Audio.js'
import { SupportedType } from '../script/ScriptManager.js'

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
        return `TagComponent:
          Tag: ${this.name}\n`;
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

    lastMovedTimestamp: number;

    constructor() {
        super();
        this.transform = new Mat4();
        this.positionMat = new Mat4();
        this.rotationMat = new Mat4();
        this.scaleMat = new Mat4();

        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3(0, 0, 0);
        this.scale = new Vec3(1, 1, 1);

        this.lastMovedTimestamp = 0;

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

        this.lastMovedTimestamp = Date.now();
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

        return `TransformComponent:
          ${position}  
          ${rotation}  
          ${scale}\n`;
    }
}

export class SpriteRendererComponent extends Component {
    
    #color: Color;
    #sprite: Texture;
    #name: string;
    
    constructor() {
        super();
        this.#color = new Color(1, 1, 1, 1);
        this.#sprite = null;
        this.name = '';

        this.type = ComponentType.SpriteRendererComponent;
    }

    setColor(color: Color) {
        this.#color = color;
    }

    getColor(): Color {
        return this.#color;
    }

    setSprite(sprite: Texture) {
        this.#sprite = sprite;
        this.#name = sprite.image.src.substring( sprite.image.src.lastIndexOf('/') + 1 );
    }

    getSprite() {
        return this.#sprite;
    }

    get name() {
        return this.#name;
    }

    set name(newName: string) {
        this.#name = newName;
    }

    toString() {
        return `SpriteRendererComponent:
          Color: ${this.#color}
          Texture: ${this.#sprite ? this.#sprite.image.src : 'None'}\n`;
    }
}

export class CircleRendererComponent extends Component {

    _color: Color;
    _thickness: number;
    _fade: number;

    constructor() {
        super();
        this._color = new Color(1, 1, 1, 1);
        this._thickness = 1.0;
        this._fade = 0.0;

        this.type = ComponentType.CircleRendererComponent;
    }

    get color() {
        return this._color;
    }

    set color(newColor) {
        this._color = newColor;
    }

    get thickness() {
        return this._thickness;
    }

    set thickness(newThickness) {
        this._thickness = newThickness;
    }

    get fade() {
        return this._fade;
    }

    set fade(newFade) {
        this._fade = newFade;
    }

    toString() {
        return `CircleRendererComponent:
          Color: ${this.color}  
          Thickness: ${this.thickness}  
          Fade: ${this.fade}\n`;
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

    toString() {
        return `TextRendererComponent:
          Text: ${this.text}\n`;
    }
}

export class CameraComponent extends Component {

    _isPrimary: boolean
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

    get clearColor(): Color {
        return this.sceneCamera.clearColor;
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
        const clearColor = `ClearColor: ${this.clearColor}`

        return `CameraComponent: 
          Camera:   
           ${type}   
           ${fov}   
           ${pNear}   
           ${pFar}   
           ${size}   
           ${oNear}   
           ${oFar}  
          ${primary}
          ${clearColor}\n`;
    }
}

export class NativeScriptComponent extends Component {

    Instance: ScriptableEntity;
    instanceScriptFn: Function;
    destroyScriptFn: Function;
    properties: { [key: string]: SupportedType };
    createdInEditor: boolean;

    #src: string;

    constructor() {
        super();
        this.Instance = null;
        this.instanceScriptFn = null;
        this.destroyScriptFn = null;
        this.properties = {};
        this.createdInEditor = false;

        this.#src = '';

        this.type = ComponentType.NativeScriptComponent;
    }

    bind(scriptableEntityClass: { new(): ScriptableEntity }) {
        this.instanceScriptFn = function() { return new scriptableEntityClass(); }
        this.destroyScriptFn = function(nativeScriptComponent: NativeScriptComponent) { nativeScriptComponent.Instance = null; }
    }

    deserialize() {
        for (const [name, value] of Object.entries(this.properties)) {
            this.Instance[name] = value;
        }
    }

    addProperty(name: string, value: SupportedType) {
        this.properties[name] = value;
    }

    get src() {
        return this.#src;
    }

    set src(newSrc: string) {
        this.#src = newSrc;
    }

    toStringProperties(): string {
        let propertiesString = '';

        for (const [name, value] of Object.entries(this.properties)) {
            if (typeof value == 'number' || typeof value == 'string' || typeof value == 'boolean') {
                propertiesString += `          ${name}: ${value}\n`; 
            }
        }
        return propertiesString;
    }

    toString() {
        return `NativeScriptComponent:
          Source: ${this.#src}
${this.toStringProperties()}`;
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

    update(deltaTime: number, transform: TransformComponent, gravity: Vec2, iterations: number) {
        this.body2d.update(deltaTime, transform, gravity, iterations);
    }

    moveBy(v: Vec2, transform: TransformComponent) {
        this.body2d.moveBy(v, transform);
    }

    addForce(amount: Vec2) {
        this.body2d.addForce(amount);
    }

    set width(newWidth: number) {
        this.body2d.width = newWidth;
    }

    set height(newHeight: number) {
        this.body2d.height = newHeight;
    }

    get radius() {
        return this.body2d.radius;
    }

    set radius(newRadius: number) {
        this.body2d.radius = newRadius;
    }

    set density(newDensity: number) {
        this.body2d.density = newDensity;
    }

    set restitution(newRestitution: number) {
        this.body2d.restitution = newRestitution;
    }

    set isStatic(newIsStatic: boolean) {
        this.body2d.isStatic = newIsStatic;
    }

    get linearVelocity() {
        return this.body2d.linearVelocity;
    }

    set linearVelocity(v: Vec2) {
        this.body2d.linearVelocity = v;
    }

    get gravityScale() {
        return this.body2d.gravityScale;
    }

    set gravityScale(newValue: number) {
        this.body2d.gravityScale = newValue;
    }
    
    setShape(shapeType: ShapeType) {
        this.body2d.shapeType = shapeType;
        if (shapeType == ShapeType.Circle) {
            this.body2d = Body2D.CreateCircleBody2D(this.body2d.radius, this.body2d.density, this.body2d.isStatic, this.body2d.restitution);
        }
        else {
            this.body2d = Body2D.CreateBoxBody2D(this.body2d.width, this.body2d.height, this.body2d.density, this.body2d.isStatic, this.body2d.restitution);
        }
    }

    toString() {
        return `Body2DComponent: 
          ShapeType: ${this.body2d.shapeType.valueOf()}
          Width: ${this.body2d.width}
          Height: ${this.body2d.height}
          Radius: ${this.body2d.radius}
          Density: ${this.body2d.density}
          IsStatic: ${this.body2d.isStatic ? '1' : '0'}
          Restitution: ${this.body2d.restitution}
          GravityScale: ${this.gravityScale}\n`
    }
}

export class AudioComponent extends Component {

    readonly isPlaying: boolean;

    #audio: Audio;
    #playOnStart: boolean;
    #loop: boolean;
    #name: string;
    #src: string;
    #volume: number;

    constructor() {
        super();

        this.isPlaying = false;

        this.#audio = null;
        this.#playOnStart = false;
        this.#loop = false;
        this.#volume = 0.5;

        this.type = ComponentType.AudioComponent;
    }
    
    get playOnStart() {
        return this.#playOnStart;
    }

    set playOnStart(val: boolean) {
        this.#playOnStart = val;
    }

    get loop() {
        return this.#loop;
    }

    set loop(val: boolean) {
        this.#loop = val;
    }

    get audio() {
        return this.#audio;
    }

    setAudio(audio: Audio) {
        this.#audio = audio;
        this.#audio.modifyVolume(this.#volume);
    }

    get name() {
        return this.#name;
    }

    set name(newName: string) {
        this.#name = newName;
    }

    set src(newSrc: string){
        this.#src = newSrc;
    }

    get volume() {
        return this.#volume;
    }

    set volume(newVolume: number) {
        this.#volume = newVolume;
        
        if (this.#audio) {
            this.#audio.modifyVolume(this.#volume);
        } 
    } 

    play() {
        this.#audio.play(this.#loop);
    }

    toString() {
        return `AudioComponent:
          Source: ${this.#src}
          PlayOnStart: ${this.#playOnStart ? '1' : '0'}
          Loop: ${this.#loop ? '1' : '0'}
          Volume: ${this.#volume}\n`;
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
ComponentCreator[ComponentType.Body2DComponent] = Body2DComponent;
ComponentCreator[ComponentType.AudioComponent] = AudioComponent;
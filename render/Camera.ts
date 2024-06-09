import { canvas } from '../core/Window.js'
import { Log } from '../core/Log.js'
import { Event, EventType, EventDispatcher } from '../event/Event.js'
import { Utils, Vec3, Mat4 } from '../math/BananaMath.js';

export enum CameraType {
    Orthographic = 0, 
    Perspective = 1,
};

export class Camera {
    projectionMatrix: Mat4;
    cameraType: CameraType;
    aspectRatio: number;

    size: number = 10;
    orthographicNear: number = -1;
    orthographicFar: number = 1;
    
    fovy: number = 45;
    perspectiveNear: number = 10;
    perspectiveFar: number = 1000;

    constructor() {
        this.projectionMatrix = new Mat4();  
    
        this.cameraType = CameraType.Orthographic;      
        this.aspectRatio = parseFloat(canvas.width) / parseFloat(canvas.height);
    }

    set projType(projType: CameraType | string | number) {
        if (projType == CameraType.Orthographic || projType == 'Orthographic' || projType == 0) {
            this.cameraType = CameraType.Orthographic;
        }
        else if (projType == CameraType.Perspective || projType == 'Perspective' || projType == 1) {
            this.cameraType = CameraType.Perspective;
        }

        this.setViewportSize();
    }

    setOrthographic(size, near, far) {
        this.cameraType = CameraType.Orthographic;

        this.size = size;
        this.orthographicNear = near;
        this.orthographicFar = far;

        this.setViewportSize();
    }

    setPerspective(fovy, near, far) {
        this.cameraType = CameraType.Perspective;

        this.fovy = fovy;
        this.perspectiveNear = near;
        this.perspectiveFar = far;

        this.setViewportSize();
    }

    getViewProjectionMatrix() {
        return this.projectionMatrix;
    }

    getCameraType() {
        return this.cameraType;
    }

    setViewportSize() {
        if (this.cameraType == CameraType.Orthographic) {
            let orthoLeft = -this.size * this.aspectRatio * 0.5;
            let orthoRight = this.size * this.aspectRatio * 0.5;
            let orthoBottom = this.size * 0.5;
            let orthoTop = -this.size * 0.5;
    
            this.projectionMatrix.setOrtho(orthoLeft, orthoRight, orthoBottom, orthoTop, this.orthographicNear, this.orthographicFar);
        }
        else if (this.cameraType == CameraType.Perspective) {
            this.projectionMatrix.setPerspective(Utils.toRadians(this.fovy), this.aspectRatio, this.perspectiveNear, this.perspectiveFar);
        }
    }

    screenToViewportSpace(vector: Vec3) {
        return new Vec3(
            (vector.x - canvas.width / 2) / (canvas.height / this.size),
            (vector.y - canvas.height / 2) / (canvas.height / this.size),
            vector.z
        );
    }
}

export class SceneCamera extends Camera {
    constructor() {
        super();

        this.onWindowResized = this.onWindowResized.bind(this);

        this.setOrthographic(10, -1, 1);
    }

    onEvent(event) {
        const dispatcher = new EventDispatcher(event);

        dispatcher.dispatch(this.onWindowResized, EventType.WindowResizedEvent);
    }

    onWindowResized(event) {
        this.aspectRatio = parseFloat(canvas.width) / parseFloat(canvas.height)
        this.setViewportSize();

        return true;
    }
}

export class EditorCamera extends Camera {

    viewMatrix: Mat4;
    viewProjectionMatrix: Mat4;

    cameraPosition: Vec3;
    cameraRotation: number;

    constructor() {
        super();

        this.viewMatrix = new Mat4();
        this.viewProjectionMatrix = new Mat4();
        
        this.cameraPosition = new Vec3(0, 0, 0);
        this.cameraRotation = 0;

        this.setView();
        this.setOrthographic(446, -1, 1);
        this.recalculateViewProjectionMatrix();
    }

    setView() {
        this.viewMatrix.setTranslation(this.cameraPosition);

        this.viewMatrix.applyRotationZ(this.cameraRotation);

        this.viewMatrix.invert();

        this.viewMatrix.transpose();
    }

    getViewProjectionMatrix() {
        return this.viewProjectionMatrix;
    }

    recalculateViewProjectionMatrix() {
        this.viewProjectionMatrix.identity();
        this.viewProjectionMatrix.mul(this.projectionMatrix);
        this.viewProjectionMatrix.mul(this.viewMatrix);
    }

    getPosition() {
        return Vec3.copy(this.cameraPosition);
    }

    setPosition(x, y, z) {
        this.cameraPosition.x = x;
        this.cameraPosition.y = y;
        this.cameraPosition.z = z;

        this.setView();
        this.recalculateViewProjectionMatrix();
    }

    getRotation() {
        return this.cameraRotation;
    }

    setRotation(angle) {
        this.cameraRotation = angle;

        this.setView();
        this.recalculateViewProjectionMatrix();
    }
}
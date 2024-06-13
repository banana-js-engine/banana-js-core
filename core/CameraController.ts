import { Input } from "./Input.js"
import { EditorCamera } from "../render/Camera.js"
import { MouseButton } from "./MouseButtonCode.js"
import { Event, EventDispatcher, EventType } from "../event/Event.js"
import { canvas } from "./Window.js"
import { KeyCode } from "./KeyCode.js"
import { GamepadInputCode } from "./GamepadInputCode.js"
import { Vec2, Vec3 } from "../math/BananaMath.js"

export class EditorCameraController 
{
    cameraPanSpeed: number;
    cameraAngle: number;
    zoomLevel: number;
    defaultCameraSize: number;
    previousMousePosition: Vec3;
    editorCamera: EditorCamera;

    constructor() {
        this.onMouseButtonClicked = this.onMouseButtonClicked.bind(this);
        this.onMouseScrolled = this.onMouseScrolled.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);

        this.cameraPanSpeed = 1;
        this.cameraAngle = 0;
        this.zoomLevel = 1.0;
        this.defaultCameraSize = 10;
        this.previousMousePosition = new Vec3(Input.mousePosition.x, Input.mousePosition.y, 0);

        this.editorCamera = new EditorCamera();
    }

    getCamera() {
        return this.editorCamera;
    }

    update(deltaTime: number) {
        if (Input.isMouseButtonPressed(MouseButton.MOUSE_MIDDLE)) {            
            const direction = new Vec3(0, 0, 0);
            const currentMousePos = this.editorCamera.screenToViewportSpace( Input.mousePosition );

            direction.x = (this.previousMousePosition.x - currentMousePos.x) * this.cameraPanSpeed;
            direction.y = (this.previousMousePosition.y - currentMousePos.y) * this.cameraPanSpeed;

            if (direction.equals(Vec3.ZERO)) {
                return;
            }

            this.editorCamera.setPosition(this.editorCamera.getPosition().x + direction.x, this.editorCamera.getPosition().y + direction.y, 0.0);
            
            this.previousMousePosition.x = currentMousePos.x;
            this.previousMousePosition.y = currentMousePos.y;
        }
    }

    onEvent(event) {
        let dispatcher = new EventDispatcher(event);

        dispatcher.dispatch(this.onMouseButtonClicked, EventType.MouseButtonClickedEvent);
        dispatcher.dispatch(this.onMouseScrolled, EventType.MouseScrolledEvent);
        dispatcher.dispatch(this.onWindowResized, EventType.WindowResizedEvent);
    }

    onMouseScrolled(event) {
        if (event.getOffsetY() > 0) {
            this.zoomLevel += 0.25;
            this.zoomLevel = Math.min(2.0, this.zoomLevel);
            this.editorCamera.setOrthographic(
                this.defaultCameraSize * this.zoomLevel,
                this.editorCamera.orthographicNear,
                this.editorCamera.orthographicFar
            );
        }
        else if (event.getOffsetY() < 0) {
            this.zoomLevel -= 0.25;
            this.zoomLevel = Math.max(0.25, this.zoomLevel);
            this.editorCamera.setOrthographic(
                this.defaultCameraSize * this.zoomLevel,
                this.editorCamera.orthographicNear,
                this.editorCamera.orthographicFar
            );
        }

        this.editorCamera.recalculateViewProjectionMatrix();

        return true;
    }

    onMouseButtonClicked(event) {
        this.previousMousePosition = this.editorCamera.screenToViewportSpace( Input.mousePosition );

        return true;
    }

    onWindowResized(event) {
        this.editorCamera.aspectRatio = parseFloat(event.getWidth()) / parseFloat(event.getHeight());
        this.editorCamera.setViewportSize();
        this.editorCamera.recalculateViewProjectionMatrix();

        return true;
    }
}
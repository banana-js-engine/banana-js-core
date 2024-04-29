import { Input } from "./Input.ts"
import { EditorCamera } from "../render/Camera.ts"
import { MouseButton } from "./MouseButtonCode.ts"
import { Event, EventDispatcher, EventType } from "../event/Event.ts"
import { canvas } from "./Window.ts"
import { KeyCode } from "./KeyCode.ts"
import { GamepadButtonCode } from "./GamepadButtonCode.ts"
import { Vec2, Vec3 } from "../math/MV.ts"

export class EditorCameraController 
{
    cameraPanSpeed: number;
    cameraAngle: number;
    zoomLevel: number;
    previousMousePosition: Vec2;
    editorCamera: EditorCamera;

    constructor() {
        this.onMouseButtonClicked = this.onMouseButtonClicked.bind(this);
        this.onMouseScrolled = this.onMouseScrolled.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);

        this.cameraPanSpeed = 60;
        this.cameraAngle = 0;
        this.zoomLevel = 1.0
        this.previousMousePosition = new Vec2(Input.mousePosition.x, Input.mousePosition.y);

        this.editorCamera = new EditorCamera();
    }

    getCamera() {
        return this.editorCamera;
    }

    update(deltaTime) {
        if (Input.isMouseButtonPressed(MouseButton.MOUSE_MIDDLE)) {
            let direction = new Vec2(0, 0);
            direction.x = (this.previousMousePosition.x - Input.mousePosition.x) * this.zoomLevel / 1.5;
            direction.y = (this.previousMousePosition.y - Input.mousePosition.y) * this.zoomLevel / 1.5;

            if (direction.equals(Vec2.ZERO)) {
                return;
            }

            this.editorCamera.setPosition(this.editorCamera.getPosition().x + direction.x, this.editorCamera.getPosition().y + direction.y, 0.0);
            
            this.previousMousePosition.x = Input.mousePosition.x;
            this.previousMousePosition.y = Input.mousePosition.y;
        }

        if (Input.isKeyPressed(KeyCode.Q)) {
            this.cameraAngle--;
            this.editorCamera.setRotation(this.cameraAngle);
        }
        if (Input.isKeyPressed(KeyCode.E)) {
            this.cameraAngle++;
            this.editorCamera.setRotation(this.cameraAngle);
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
                446 * this.zoomLevel,
                this.editorCamera.orthographicNear,
                this.editorCamera.orthographicFar);
        }
        else if (event.getOffsetY() < 0) {
            this.zoomLevel -= 0.25;
            this.zoomLevel = Math.max(0.25, this.zoomLevel);
            this.editorCamera.setOrthographic(
                446 * this.zoomLevel,
                this.editorCamera.orthographicNear,
                this.editorCamera.orthographicFar);
        }

        this.editorCamera.recalculateViewProjectionMatrix();

        return true;
    }

    onMouseButtonClicked(event) {
        this.previousMousePosition = new Vec2(Input.mousePosition.x, Input.mousePosition.y);

        return true;
    }

    onWindowResized(event) {
        this.editorCamera.aspectRatio = parseFloat(event.getWidth()) / parseFloat(event.getHeight());
        this.editorCamera.setViewportSize();
        this.editorCamera.recalculateViewProjectionMatrix();

        return true;
    }
}
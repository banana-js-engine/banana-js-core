import { WebGLContext } from '../render/WebGLContext.js' 
import { Log } from './Log.js'
import { Input } from './Input.js'
import * as mouse from '../event/MouseEvent.js'
import * as keyboard from '../event/KeyboardEvent.js'
import * as application from '../event/ApplicationEvent.js'
import * as gamepad from '../event/GamepadEvent.js'
import { KeyCode } from './KeyCode.js'
import { Color } from '../render/Color.js'

export class Window {
    title: string;
    eventCallbackFn: Function;
    context: WebGLContext | WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    actualWindow: WindowProxy;

    static mainWidth: number;
    static mainHeight: number;

    constructor(title: string, width: number, height: number, isMainWindow: boolean = true) {
        this.title = title;
        this.eventCallbackFn = function(event) {}

        if (isMainWindow) {
            this.actualWindow = window;
        }
        else {
            const features = `width=${width},height=${height},location=no`;
            this.actualWindow = window.open('', '', features);
        }

        this.canvas = this.#createCanvas();
        this.actualWindow.document.body.appendChild(this.canvas);

        if ( !this.canvas ) { Log.Core_Error('canvas could not be loaded'); }

        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.focus();

        if (isMainWindow) {
            Window.mainWidth = width;
            Window.mainHeight = height; 
            this.context = new WebGLContext(this.canvas);
        }
        else {
            this.context = this.canvas.getContext('webgl2');
            this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        }

        this.setTitle(this.title);

        // disable the context menu
        this.canvas.addEventListener('contextmenu', (event) => 
        {
            event.preventDefault();
        });

        Log.Core_Info(`Creating window ${this.title}, ${width}x${height}`);

        // mouse events
        this.canvas.addEventListener('dblclick', (event) => {
            event.preventDefault();
        })

        this.canvas.addEventListener('mousedown', (event) => 
        {
            let mouseButtonClickedEvent = new mouse.MouseButtonClickedEvent(event.x, event.y, event.button);

            this.eventCallbackFn(mouseButtonClickedEvent);

            Input.mouseInputFlag[`${event.button}`] = false;
            Input.buttonStates[`${event.button}`] = true;
        });

        this.canvas.addEventListener('mouseup', (event) => 
        {
            let mouseButtonReleasedEvent = new mouse.MouseButtonReleasedEvent(event.x, event.y, event.button);

            this.eventCallbackFn(mouseButtonReleasedEvent);

            Input.buttonStates[`${event.button}`] = false;
        });

        this.canvas.addEventListener('mouseleave', (event) => 
        {
            Object.keys(Input.buttonStates).forEach(button => {
                Input.buttonStates[`${button}`] = false;
            });
        })

        this.canvas.addEventListener('mousemove', (event) => {

            Input.mousePosition.x = event.x;
            Input.mousePosition.y = event.y;
        })

        this.canvas.addEventListener('wheel', (event) => 
        {
            let mouseScrolledEvent = new mouse.MouseScrolledEvent(event.deltaX, event.deltaY);

            this.eventCallbackFn(mouseScrolledEvent);
        });

        // keyboard events

        this.canvas.addEventListener('keydown', (event) => 
        {
            let keyboardButtonPressedEvent = new keyboard.KeyboardButtonPressedEvent(event.key as KeyCode);

            this.eventCallbackFn(keyboardButtonPressedEvent);

            Input.keyStates[event.key] = true;
        })

        this.canvas.addEventListener('keyup', (event) => 
        {
            let keyboardButtonReleasedEvent = new keyboard.KeyboardButtonReleasedEvent(event.key as KeyCode);

            this.eventCallbackFn(keyboardButtonReleasedEvent);

            Input.keyStates[event.key] = false;
        })

        window.addEventListener('resize', (event) => 
        {
            let windowResizedEvent = new application.WindowResizedEvent(window.innerWidth, window.innerHeight);

            this.eventCallbackFn(windowResizedEvent);
        })

        window.addEventListener('beforeunload', (event) => 
        {

            let windowClosedEvent = new application.WindowClosedEvent();

            this.eventCallbackFn(windowClosedEvent);
        })

        // gamepad events
        window.addEventListener('gamepadconnected', (event) => 
        {
            let gamepadConnectedEvent = new gamepad.GamepadConnectedEvent(event.gamepad);

            this.eventCallbackFn(gamepadConnectedEvent);
        });

        window.addEventListener('gamepaddisconnected', (event) => 
        {
            let gamepadDisconnectedEvent = new gamepad.GamepadDisconnectedEvent(event.gamepad);

            this.eventCallbackFn(gamepadDisconnectedEvent);
        });
    }

    get width() {
        return this.canvas.width;
    }

    set width(newWidth) {
        this.canvas.width = newWidth;
    }

    get height() {
        return this.canvas.height;
    }

    set height(newHeight) {
        this.canvas.height = newHeight;
    }

    setEventCallback(callbackFn: Function) {
        this.eventCallbackFn = callbackFn;
    }

    setTitle(titleText: string) {
        this.actualWindow.document.title = titleText;
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        
        window.resizeTo(width, height);

        let windowResizedEvent = new application.WindowResizedEvent(window.innerWidth, window.innerHeight);

        this.eventCallbackFn(windowResizedEvent);
    }

    clear(color: Color) {
        const context = this.context as WebGL2RenderingContext
        context.clearColor(color.r, color.g, color.b, color.a);
        context.clear(context.COLOR_BUFFER_BIT);
    }

    close() {
        this.actualWindow.close();
    }

    #createCanvas(): HTMLCanvasElement {
        const canvas = this.actualWindow.document.createElement('canvas');
        canvas.tabIndex = 1;
        canvas.id = 'banana-canvas';
        canvas.style.userSelect = 'none';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.right = '0px';
        canvas.style.top = '0px';
        canvas.style.bottom = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        return canvas;
    }
}
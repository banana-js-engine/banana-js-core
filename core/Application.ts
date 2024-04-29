import { Log } from "./Log.ts"
import { Window, canvas } from "./Window.ts"
import { Event, EventDispatcher, EventType } from "../event/Event.ts"
import { LayerStack } from "./LayerStack.ts"
import { RenderCommand } from "../render/RenderCommand.ts"
import { Gamepad } from "./Gamepad.ts"


export class Application
{
    isRunning: boolean;
    window: Window;
    gamepad: Gamepad;
    layerStack: LayerStack;
    lastFrameTime: number;

    public constructor(appName, windowWidth, windowHeight) {
        this.onEvent = this.onEvent.bind(this);
        this._onTick = this._onTick.bind(this);
        this.onWindowClosed = this.onWindowClosed.bind(this);
        this.onWindowResized = this.onWindowResized.bind(this);

        this.isRunning = true;

        this.window = new Window(appName, windowWidth, windowHeight);
        this.window.setEventCallback(this.onEvent);

        this.gamepad = new Gamepad();

        this.layerStack = new LayerStack();

        this.lastFrameTime = 0;

        this.window.resize(windowWidth, windowHeight);
    }

    public run() {
        this.layerStack.getLayers().forEach(layer => {
            layer.onGUIRender();
        });

        this._onTick();
    }

    public onUpdate(deltaTime) {

    }

    private _onTick() {
        let currentFrameTime = Date.now();
        let deltaTimeMilliseconds = currentFrameTime - this.lastFrameTime;
        let deltaTimeSeconds = deltaTimeMilliseconds / 1000;
        this.lastFrameTime = currentFrameTime;
        let fps = 1 / deltaTimeSeconds;

        //Log.Core_Info(`Delta time: ${deltaTimeSeconds}s (${deltaTimeMilliseconds}ms)`);
        //Log.Core_Info(`FPS: ${fps}`);

        if (deltaTimeSeconds > 1) {
            deltaTimeSeconds = 0.13;
        }

        this.onUpdate(deltaTimeSeconds);

        this.layerStack.getLayers().forEach(layer => 
        {
            layer.onUpdate(deltaTimeSeconds);
        });
        
        requestAnimationFrame(this._onTick);
    }


    public onEvent(event) {
        let dispatcher = new EventDispatcher(event);

        dispatcher.dispatch(this.onWindowClosed, EventType.WindowClosedEvent);
        dispatcher.dispatch(this.onWindowResized, EventType.WindowResizedEvent);

        for (let i = 0; i < this.layerStack.getLayers().length; i++) 
        {
            this.layerStack.getLayers()[i].onEvent(event);
            if ( event.handled ) { break; }
        }

        Gamepad.Instance.onEvent(event);

        Log.Core_Info(event);
    }

    public onWindowClosed(event) {
        //Profiler.EndProfile();
        
        return true;
    }

    public onWindowResized(event) {
        canvas.width = event.getWidth();
        canvas.height = event.getHeight();
        RenderCommand.setViewport(event.getWidth(), event.getHeight());

        return true;
    }

    public pushLayer(layer) {
        this.layerStack.pushLayer(layer);
        layer.onAttach();
    
        Log.Core_Info(`${layer.getDebugName()} is attached`);
    }

    public pushOverlay(overlay) {
        this.layerStack.pushOverlay(overlay);
        overlay.onAttach();

        Log.Core_Info(`${overlay.getDebugName()} is attached`);
    }

    public setTitle(title) {
        this.window.setTitle(title);
    }

    public static createApplication(): Application {
        return null;
    }
}
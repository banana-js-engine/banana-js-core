import { Log } from "./Log.js"
import { Window, canvas } from "./Window.js"
import { Event, EventDispatcher, EventType } from "../event/Event.js"
import { LayerStack } from "./LayerStack.js"
import { RenderCommand } from "../render/RenderCommand.js"
import { Renderer2D } from "../render/Renderer2D.js";
import { Gamepad } from "./Gamepad.js"
import { Mat4, Utils } from "../math/BananaMath.js"
import { ImGUILayer } from "./ImGUILayer.js"


export class Application
{
    isRunning: boolean;
    window: Window;
    gamepad: Gamepad;
    layerStack: LayerStack;
    lastFrameTime: number;
    imGuiLayer: ImGUILayer;

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

        Renderer2D.init();

        this.lastFrameTime = 0;

        this.window.resize(windowWidth, windowHeight);

        this.imGuiLayer = new ImGUILayer();
        this.pushOverlay(this.imGuiLayer);
    }

    public run() {
        Mat4.init();
        this._onTick();
    }

    private _onTick() {

        let currentFrameTime = performance.now();
        let deltaTimeMilliseconds = currentFrameTime - this.lastFrameTime;
        let deltaTimeSeconds = deltaTimeMilliseconds / 1000;
        this.lastFrameTime = currentFrameTime;

        deltaTimeSeconds = Utils.clamp(deltaTimeSeconds, 0.01, 0.1);

        // onUpdate
        this.layerStack.getLayers().forEach(layer => 
        {
            layer.onUpdate(deltaTimeSeconds);
        });

        // onImGuiRender
        this.imGuiLayer.begin();
        this.layerStack.getLayers().forEach(layer => 
        {
            layer.onImGuiRender();
        });
        this.imGuiLayer.end();
        
        requestAnimationFrame(this._onTick);
    }


    public onEvent(event: Event) {
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

    public onWindowClosed(event: Event) {
        //Profiler.EndProfile();
        
        return true;
    }

    public onWindowResized(event) {
        canvas.width = event.getWidth();
        canvas.height = event.getHeight();
        RenderCommand.setViewport(event.getWidth(), event.getHeight());

        return false;
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

    public setTitle(title: string) {
        this.window.setTitle(title);
    }

    public static createApplication(): Application {
        return null;
    }
}
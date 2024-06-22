import { Log } from "../core/Log.js"
import { Color } from "./Color.js";
import { RenderCommand } from "./RenderCommand.js";

export let gl;

export class WebGLContext {

    maxTextureCount: number;

    constructor(canvas: HTMLCanvasElement) {
        gl = canvas.getContext('webgl2', { antialias: false });
        if ( !gl ) { 
            Log.Core_Error('WebGL isn\'t available'); 
        }
        else {
            RenderCommand.setViewport(canvas.width, canvas.height);

            RenderCommand.setClearColor( Color.BLACK );

            this.maxTextureCount = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

            RenderCommand.resetState();
        }
    }
}
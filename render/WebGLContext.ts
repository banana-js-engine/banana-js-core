import { Log } from "../core/Log.js"
import { RenderCommand } from "./RenderCommand.js";

export let gl;

export class WebGLContext {

    maxTextureCount: number;

    constructor(canvas: HTMLCanvasElement) {
        gl = canvas.getContext('webgl2');
        if ( !gl ) { 
            Log.Core_Error('WebGL isn\'t available'); 
        }
        else {
            gl.viewport( 0, 0, canvas.width, canvas.height );

            this.maxTextureCount = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

            RenderCommand.resetState();
        }
    }
}
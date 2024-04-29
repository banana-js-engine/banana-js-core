import { Log } from "../core/Log.ts"

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

            //gl.enable(gl.CULL_FACE);
            //gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
    }
}
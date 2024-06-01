import { Color } from "./Color.js";
import { gl } from "./WebGLContext.js"

export class RenderCommand {
    static setViewport(width: number, height: number) {
        gl.viewport(0, 0, width, height);
    }

    static setClearColor(color: Color) {
        gl.clearColor(color.r, color.g, color.b, color.a);
    }

    /**
     * Clears the canvas.
     */
    static clear() {
        gl.clear( gl.COLOR_BUFFER_BIT );
    }

}
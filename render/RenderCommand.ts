import { gl } from "./WebGLContext.js"

export class RenderCommand {
    static setViewport(width, height) {
        gl.viewport(0, 0, width, height);
    }

    static setClearColor(color) {
        gl.clearColor(color.x, color.y, color.z, color.w);
    }

    /**
     * Clears the canvas.
     */
    static clear() {
        gl.clear( gl.COLOR_BUFFER_BIT );
    }

}
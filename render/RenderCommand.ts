import { gl } from "./WebGLContext.ts"

export class RenderCommand {
    static setViewport(width, height) {
        gl.viewport(0, 0, width, height);
    }

    static setClearColor(color) {
        gl.clearColor(color[0], color[1], color[2], color[3]);
    }

    /**
     * Clears the canvas.
     */
    static clear() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    }

}
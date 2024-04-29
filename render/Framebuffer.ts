import { Log } from "../core/Log.ts"
import { gl } from "./WebGLContext.ts"

export class FramebufferSpecification
{
    width: number;
    height: number;
    samples: number;
    swapChainTarget: boolean;

    constructor() {
        this.samples = 1;

        this.swapChainTarget = false;
    }
}

export class Framebuffer 
{
    spec: FramebufferSpecification;

    framebufferId: number;
    colorAttachment: number;

    constructor(spec) 
    {
        this.spec = spec;

        this.invalidate();
    }

    invalidate() 
    {
        this.framebufferId = gl.createFramebuffer();

        this.bind();
        
        this.colorAttachment = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.colorAttachment);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.spec.width, this.spec.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorAttachment, 0);

        if (!gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) 
        {
            Log.Core_Error('Framebuffer is incomplete!');
        }
        
        this.unbind();
    }

    bind() 
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferId);
    }

    unbind() 
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    getColorAttachmentId() 
    {
        return this.colorAttachment;
    }
}
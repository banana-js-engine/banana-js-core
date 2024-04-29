import { Log } from "../core/Log.ts"
import { gl } from "./WebGLContext.ts"

export class Texture {

    textureId: number;
    loaded: boolean;
    width: number;
    height: number;
    image: HTMLImageElement;

    constructor(src?: string) {
        this.textureId = gl.createTexture();
        this.loaded = false;
        this.bind();
        

        // Fill the texture with a 1x1 white pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 255, 255]));

        this.width = 1;
        this.height = 1;
            
        if (typeof src == 'undefined') {
            return;
        }

        this.onLoad = this.onLoad.bind(this)
        
        this.image = new Image();
        this.image.src = src;
        this.image.addEventListener('load', this.onLoad);
        
        // error handling
        this.image.addEventListener('error', (error) => {
            Log.Core_Error(`${error.type}: Loading image`);
            this.image.removeEventListener('error', this.onLoad);
        });
    }

    bind(unit: number = 0) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    }

    unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    onLoad() {     
        this.bind();

        this.loaded = true;

        this.width = this.image.width;
        this.height = this.image.height;
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        // gl.generateMipmap(gl.TEXTURE_2D);

        Log.Core_Info(`Loaded texture with:
                    Width: ${this.width}px
                    Height: ${this.height}px
                    Source: ${this.image.src}`);

        this.image.removeEventListener('load', this.onLoad);
        
        this.unbind();
    }

    getImage() 
    {
        return this.image;
    }

    isLoaded() 
    {
        return this.loaded;
    }

    getWidth() 
    {
        return this.width;
    }

    getHeight() 
    {
        return this.height;
    }
}
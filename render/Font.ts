import { Vec2 } from "../banana.js";
import { GlyphData } from "./GlyphData.js";
import { SubTexture } from "./SubTexture.js";
import { Texture } from "./Texture.js";

export class Font {

    atlasTexture: Texture;
    glyphData: GlyphData;
    glyphs: { [key: string]: SubTexture }

    static defaultFont: Font;

    constructor(filepath: string, glyphData: GlyphData) {
        this.atlasTexture = new Texture(filepath);
        this.glyphData = glyphData;

        // create a sub-texture per letter
        this.glyphs = {};

        const glyphSize = new Vec2( 0, glyphData.letterHeight );
        
        for (let key in glyphData.glyphInfos) {
            glyphSize.x = glyphData.glyphInfos[key].width;
            
            const glyphCoord = new Vec2(0, 0);
            glyphCoord.x = glyphData.glyphInfos[key].x / glyphSize.x;
            glyphCoord.y = glyphData.glyphInfos[key].y / glyphSize.y;

            this.glyphs[key] = new SubTexture(this.atlasTexture, glyphCoord, glyphSize);
        }
    }
}
import { Vec2 } from '../math/MV.ts';
import { Renderer2D } from './Renderer2D.ts'
import { Texture } from './Texture.ts';

const defaultTexCoords = [
    new Vec2(0, 0), 
    new Vec2(1, 0), 
    new Vec2(0, 1), 
    new Vec2(1, 1)
];

export class SubTexture {
    
    spriteSheet: Texture;
    spriteSheetCoords: Vec2;
    cellSize: Vec2;
    spriteSize: Vec2;
    texCoords: Vec2[];
    
    constructor(spriteSheet, coords, cellSize, spriteSize = new Vec2(1, 1)) {
        this.spriteSheet = spriteSheet;
        this.spriteSheetCoords = coords;
        this.cellSize = cellSize;
        this.spriteSize = spriteSize;

        this.onTextureLoad = this.onTextureLoad.bind(this);

        if (this.spriteSheet.isLoaded()) {
            this.onTextureLoad();
            return;
        }

        this.spriteSheet.getImage().addEventListener('load', this.onTextureLoad);
    }

    onTextureLoad() {
        const min = new Vec2((this.spriteSheetCoords.x * this.cellSize.x) / this.spriteSheet.getWidth(),
                              (this.spriteSheetCoords.y * this.cellSize.y) / this.spriteSheet.getHeight());
    
        const max = new Vec2(((this.spriteSheetCoords.x + this.spriteSize.x) * this.cellSize.x) / this.spriteSheet.getWidth(),
                              ((this.spriteSheetCoords.y + this.spriteSize.y) * this.cellSize.y) / this.spriteSheet.getHeight());

        this.texCoords = [
            new Vec2(min.x, min.y),
            new Vec2(max.x, min.y),
            new Vec2(min.x, max.y),
            new Vec2(max.x, max.y)
        ];

        this.spriteSheet.image.removeEventListener('load', this.onTextureLoad);
    }

    getTexCoords() {
        if (typeof this.texCoords == 'undefined') {
            return defaultTexCoords;
        }

        return this.texCoords;
    }

    getTexture() {
        if (typeof this.spriteSheet == 'undefined') {
            return Renderer2D.White_Texture;
        }

        return this.spriteSheet;
    }
}
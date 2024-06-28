type GlyphInfo = {
    x: number;
    y: number;
    width: number;
};

export type GlyphData = {
    letterHeight: number;
    spaceWidth: number;
    spacing: number;
    textureWidth: number;
    textureHeight: number;
    glyphInfos: { [key: string]: GlyphInfo };
};
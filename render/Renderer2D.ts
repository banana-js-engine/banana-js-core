import { IndexBuffer, VertexBuffer } from "./Buffer.js"
import { Color } from "./Color.js"
import { Shader } from "./Shader.js"
import { Texture } from "./Texture.js"
import { gl } from "./WebGLContext.js"
import { Mat4, Vec2, Vec3, Vec4 } from "../math/BananaMath.js"
import { Camera, Log, RenderCommand, SubTexture, TransformComponent, canvas } from "../banana.js"
import { Font } from "./Font.js"

import { defaultFontData } from "./data/defaultFontData.js";

class Render2DData
{
    // scene data
    static ViewProj: Mat4 = null;

    // quads
    static MaxQuads = 10000;
    static MaxVertices = Render2DData.MaxQuads * 4;
    static MaxIndices = Render2DData.MaxQuads * 6; 
    static QuadVertexPositions = [
        new Vec4(-0.5, -0.5, 0, 1),
        new Vec4(0.5, -0.5, 0, 1),
        new Vec4(-0.5, 0.5, 0, 1),
        new Vec4(0.5, 0.5, 0, 1),
    ];

    static QuadTextureCoords = [
        new Vec2(0, 0),
        new Vec2(1, 0),
        new Vec2(0, 1),
        new Vec2(1, 1),
    ];

    static MaxTextureSlots = 16;
    static TextureSlotIndex = 1;
    static TextureSlots = [];

    static QuadVertexCount = 0;
    static QuadIndexCount = 0;
    
    static QuadShader: Shader = null;
    static QuadVertexBuffer: VertexBuffer = null;
    static QuadIndexBuffer: IndexBuffer = null;

    // lines
    static LineVertexCount = 0;

    static LineShader: Shader = null;
    static LineVertexBuffer: VertexBuffer = null; 

    // circles
    static CircleVertexCount = 0;
    static CircleIndexCount = 0;

    static CircleShader: Shader = null;
    static CircleVertexBuffer: VertexBuffer = null;

    static CircleFragCoords = [
        new Vec2(-1, -1),
        new Vec2(1, -1),
        new Vec2(-1, 1),
        new Vec2(-1, -1),
    ];
};

class QuadVertex {
    position: Vec4 | null = null;
    texCoord: Vec2 | null = null;
    texIndex: number | null = null;
    color: Color | null = null;

    flat(): number[] {
        if (!this.position || !this.texCoord || this.texIndex === null || !this.color) {
            Log.Core_Error('Initialize all fields before calling flat()!');
        }

        return [
            this.position.x,
            this.position.y,
            this.position.z,
            this.position.w,
            this.texCoord.x,
            this.texCoord.y,
            this.texIndex,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        ];
    }

    static readonly VertexSize = 11;
}

class LineVertex {
    position: Vec4 | null = null;
    color: Color | null = null;

    flat(): number[] {
        if (!this.position || !this.color) {
            Log.Core_Error('Initialize all fields before calling flat()!');
        }

        return [
            this.position.x,
            this.position.y,
            this.position.z,
            this.position.w,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a
        ];
    }

    static readonly VertexSize = 8;
}

class CircleVertex {
    position: Vec4 | null = null;
    fragCoord: Vec2 | null = null;
    color: Color | null = null;
    thickness: number | null = null;
    fade: number | null = null;

    flat(): number[] {
        if (!this.position || !this.fragCoord || !this.color || this.thickness === null || this.fade === null) {
            Log.Core_Error('Initialize all fields before calling flat()!');
        }

        return [
            this.position.x,
            this.position.y,
            this.position.z,
            this.position.w,
            this.fragCoord.x,
            this.fragCoord.y,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a,
            this.thickness,
            this.fade
        ];
    }

    static readonly VertexSize = 12;
}

/**
 * Main 2D rendering API of banana.js, responsible for all 2D rendering.
 * Capabilities:
 *      - rendering quads, (colored, textured or using subtextures)
 *      - rendering circles,
 *      - rendering lines,
 *      - TODO: rendering text
 */
export class Renderer2D {
    static White_Texture: Texture;
    
    // for caching purposes
    static viewProj = new Mat4();
    static quadVertex = new QuadVertex();
    static lineVertex = new LineVertex();
    static circleVertex = new CircleVertex();
    static tempTransform: TransformComponent;

    /**
     * This object is used to display rendering/batching data to the developer.
     */
    static Stats = {
        BatchCount: 0,
        QuadCount: 0,

        getTotalTriangleCount : function() {
            return this.QuadCount * 2;
        },

        getTotalVertexCount : function() {
            return this.QuadCount * 4;
        },

        getTotalIndexCount : function() {
            return this.QuadCount * 6;
        }
    }
    
    static init() {
        // empty constructor of Texture will produce 1x1 white texture
        Renderer2D.White_Texture = new Texture();
        Font.defaultFont = new Font('/render/data/defaultFont.png', defaultFontData);
        this.tempTransform = new TransformComponent();

        // prepare indices for index buffer creation
        let quadIndices = new Uint16Array( Render2DData.MaxIndices );
        
        let offset = 0;
        for (let i = 0; i < Render2DData.MaxIndices; i += 6) {
            quadIndices[i + 0] = offset + 0;
            quadIndices[i + 1] = offset + 1;
            quadIndices[i + 2] = offset + 2;
            
            quadIndices[i + 3] = offset + 1;
            quadIndices[i + 4] = offset + 2;
            quadIndices[i + 5] = offset + 3;
            
            offset += 4;
        }
        
        // Quads
        Render2DData.QuadShader = new Shader('/shader/Renderer2D_Quad.glsl');

        Render2DData.QuadVertexBuffer = new VertexBuffer(Render2DData.MaxVertices * QuadVertex.VertexSize);
        Render2DData.QuadIndexBuffer = new IndexBuffer(quadIndices);
        
        const aPosition = Render2DData.QuadShader.getAttributeLocation('a_Position');
        const aTexCoord = Render2DData.QuadShader.getAttributeLocation('a_TexCoord');
        const aTexIndex = Render2DData.QuadShader.getAttributeLocation('a_TexIndex');
        const aColor = Render2DData.QuadShader.getAttributeLocation('a_Color');
        
        Render2DData.QuadVertexBuffer.pushAttribute(aPosition, 4);
        Render2DData.QuadVertexBuffer.pushAttribute(aTexCoord, 2);
        Render2DData.QuadVertexBuffer.pushAttribute(aTexIndex, 1);
        Render2DData.QuadVertexBuffer.pushAttribute(aColor, 4);

        let samplers = [];
        for (let i = 0; i < Render2DData.MaxTextureSlots; i++) {
            samplers[i] = i;
        }
                
        Render2DData.QuadShader.setUniform1iv('u_Textures', samplers);

        // Lines
        Render2DData.LineShader = new Shader('/shader/Renderer2D_Line.glsl');

        Render2DData.LineVertexBuffer = new VertexBuffer(Render2DData.MaxVertices * LineVertex.VertexSize);
        
        const aLinePosition = Render2DData.LineShader.getAttributeLocation('a_Position');
        const aLineColor = Render2DData.LineShader.getAttributeLocation('a_Color');
     
        Render2DData.LineVertexBuffer.pushAttribute(aLinePosition, 4);
        Render2DData.LineVertexBuffer.pushAttribute(aLineColor, 4);

        // Circles
        Render2DData.CircleShader = new Shader('/shader/Renderer2D_Circle.glsl');

        Render2DData.CircleVertexBuffer = new VertexBuffer(Render2DData.MaxVertices * CircleVertex.VertexSize);

        const aCirclePosition = Render2DData.CircleShader.getAttributeLocation('a_Position');
        const aCircleFragCoord = Render2DData.CircleShader.getAttributeLocation('a_FragCoord');
        const aCircleColor = Render2DData.CircleShader.getAttributeLocation('a_Color');
        const aCircleThickness = Render2DData.CircleShader.getAttributeLocation('a_Thickness');
        const aCircleFade = Render2DData.CircleShader.getAttributeLocation('a_Fade');

        Render2DData.CircleVertexBuffer.pushAttribute(aCirclePosition, 4);
        Render2DData.CircleVertexBuffer.pushAttribute(aCircleFragCoord, 2);
        Render2DData.CircleVertexBuffer.pushAttribute(aCircleColor, 4);
        Render2DData.CircleVertexBuffer.pushAttribute(aCircleThickness, 1);
        Render2DData.CircleVertexBuffer.pushAttribute(aCircleFade, 1);

        Render2DData.TextureSlots[0] = Renderer2D.White_Texture;
    }

    /**
     * This function needs to be called before any draw calls are made.
     * @param camera camera used to render
     * @param transform transform of the camera, fetched from TransformComponent if it's a SceneCamera, internally if it's an EditorCamera
     */
    static beginScene(camera: Camera, transform?: Mat4) {
        RenderCommand.resetState();
        Renderer2D.newBatch();

        if (typeof transform == 'undefined') {
            // this means the camera is an EditorCamera
            Render2DData.ViewProj = camera.getViewProjectionMatrix();
        }
        else {
            // this means the camera is a SceneCamera
            this.viewProj.identity();
            this.viewProj.mul(camera.getViewProjectionMatrix());
            this.viewProj.mul(transform.invert());
            this.viewProj.transpose();
        
            Render2DData.ViewProj = this.viewProj;
        }

    }

    /**
     * Renders all the draw calls made since beginScene has been called
     */
    static endScene() {        
        Renderer2D.flush();
    }

    /**
     * Renders all the draw calls. Also empties all the buffers, that's why it's referred to as flush.
     * flush is called when endScene is called or the batch size exceeds the limit.
     */
    static flush() {
        if (Render2DData.QuadIndexCount) {

            for (let i = 0; i < Render2DData.TextureSlotIndex; i++) {
                Render2DData.TextureSlots[i].bind(i);
            }

            Render2DData.QuadVertexBuffer.bind();
            Render2DData.QuadVertexBuffer.linkAttributes();
            Render2DData.QuadShader.bind();
            Render2DData.QuadShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);
            
            gl.drawElements(gl.TRIANGLES, Render2DData.QuadIndexCount, gl.UNSIGNED_SHORT, 0);
            Renderer2D.Stats.BatchCount++;
        }
        if (Render2DData.CircleIndexCount) {

            Render2DData.CircleVertexBuffer.bind();
            Render2DData.CircleVertexBuffer.linkAttributes();
            Render2DData.CircleShader.bind();
            Render2DData.CircleShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);

            gl.drawElements(gl.TRIANGLES, Render2DData.CircleIndexCount, gl.UNSIGNED_SHORT, 0);
        }
        if (Render2DData.LineVertexCount) {
            
            Render2DData.LineVertexBuffer.bind();
            Render2DData.LineVertexBuffer.linkAttributes();
            Render2DData.LineShader.bind();
            Render2DData.LineShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);
    
            gl.drawArrays(gl.LINES, 0, Render2DData.LineVertexCount);
            Renderer2D.Stats.BatchCount++;
        }
    }

    /**
     * If max index count has been exceeded, this function is used to reset everything, thus making way for a new batch
     */
    static newBatch() {
        Render2DData.QuadIndexCount = 0;
        Render2DData.QuadVertexCount = 0;

        Render2DData.LineVertexCount = 0;

        Render2DData.CircleIndexCount = 0;
        Render2DData.CircleVertexCount = 0;

        Render2DData.TextureSlotIndex = 1;
    }

    /**
     * Adds vertex data for rendering colored quad.
     * @param transform transform of the quad
     * @param color color of the quad
     */
    static drawColorQuad(transform: TransformComponent, color: Color) {

        if (Render2DData.QuadIndexCount >= Render2DData.MaxIndices) {
            Renderer2D.flush();
            Renderer2D.newBatch();
        }

        const t = transform.getTransform();

        for (let i = 0; i < 4; i++) {
            const transformedPosition = t.mulVec4(Render2DData.QuadVertexPositions[i]);

            this.quadVertex.position = transformedPosition;
            this.quadVertex.texCoord = Render2DData.QuadTextureCoords[i];
            this.quadVertex.texIndex = 0;
            this.quadVertex.color = color;
            Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
            Render2DData.QuadVertexCount++;
        }
        
        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

    /**
     * Adds vertex data for rendering a quad with a texture.
     * @param transform transform of the quad
     * @param texture texture of the quad
     */
    static drawTextureQuad(transform: TransformComponent, texture: Texture) {
        if (Render2DData.QuadIndexCount >= Render2DData.MaxIndices) {
            Renderer2D.flush();
            Renderer2D.newBatch();
        }

        let useTextureSlot = -1;

        for (let i = 0; i < Render2DData.TextureSlotIndex; i++) {
            if (Render2DData.TextureSlots[i] == texture) {
                useTextureSlot = i;
                break;
            }
        }

        if (useTextureSlot == -1) {
            useTextureSlot = Render2DData.TextureSlotIndex;
            Render2DData.TextureSlots[Render2DData.TextureSlotIndex++] = texture;
        }

        if (Render2DData.TextureSlotIndex >= 16) {
            Renderer2D.flush();
            Renderer2D.newBatch();
        }

        let t = transform.getTransform();

        for (let i = 0; i < 4; i++) {
            this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[i]);
            this.quadVertex.texCoord = Render2DData.QuadTextureCoords[i];
            this.quadVertex.texIndex = useTextureSlot;
            this.quadVertex.color = Color.WHITE;
            Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
            Render2DData.QuadVertexCount++;
        }

        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

    /**
     * Adds vertex data for rendering a quad with a texture from a part of the sprite sheet.
     * @param transform transform of the quad
     * @param subTexture sub-texture of the quad, (sub-texture is basically a part of a sprite sheet)
     */
    static drawSubTextureQuad(transform: TransformComponent, subTexture: SubTexture) {
        const texCoords = subTexture.getTexCoords();
        const texture = subTexture.getTexture();

        if (Render2DData.QuadIndexCount >= Render2DData.MaxIndices) {
            Renderer2D.flush();
            Renderer2D.newBatch();
        }

        let useTextureSlot = -1;

        for (let i = 0; i < Render2DData.TextureSlotIndex; i++) {
            if (Render2DData.TextureSlots[i] == texture) {
                useTextureSlot = i;
                break;
            }
        }

        if (useTextureSlot == -1) {
            useTextureSlot = Render2DData.TextureSlotIndex;
            Render2DData.TextureSlots[Render2DData.TextureSlotIndex++] = texture;
        }

        if (Render2DData.TextureSlotIndex >= 16) {
            Renderer2D.flush();
            Renderer2D.newBatch();
        }

        let t = transform.getTransform();

        for (let i = 0; i < 4; i++) {
            this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[i]);
            this.quadVertex.texCoord = texCoords[i];
            this.quadVertex.texIndex = useTextureSlot;
            this.quadVertex.color = Color.WHITE;
            Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
            Render2DData.QuadVertexCount++;
        }

        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

    /**
     * Adds vertex data for rendering a line with a color
     * @param p0 position of start of the line
     * @param p1 position of end of the line
     * @param color color of the line
     */
    static drawLine(p0: Vec3, p1: Vec3, color: Color) {
        this.lineVertex.position = new Vec4(p0.x, p0.y, p0.z, 1.0);
        this.lineVertex.color = color;
        Render2DData.LineVertexBuffer.addVertex(Render2DData.LineVertexCount, this.lineVertex.flat());
        Render2DData.LineVertexCount++;

        this.lineVertex.position = new Vec4(p1.x, p1.y, p1.z, 1.0);
        this.lineVertex.color = color;
        Render2DData.LineVertexBuffer.addVertex(Render2DData.LineVertexCount, this.lineVertex.flat());
        Render2DData.LineVertexCount++;
    }

    /**
     * Add vertex data for rendering a non-filled rectangle, (implementation basically renders 4 lines)
     * @param position position of the rectangle, position refers to its center
     * @param size size of the rectangle
     * @param color color of the rectangle
     */
    static drawRectangle(position: Vec3, size: Vec2, color: Color) {
        const p0 = new Vec3(position.x - size.x * 0.5, position.y - size.y * 0.5, position.z);
        const p1 = new Vec3(position.x + size.x * 0.5, position.y - size.y * 0.5, position.z);
        const p2 = new Vec3(position.x + size.x * 0.5, position.y + size.y * 0.5, position.z);
        const p3 = new Vec3(position.x - size.x * 0.5, position.y + size.y * 0.5, position.z);

        this.drawLine(p0, p1, color);
        this.drawLine(p1, p2, color);
        this.drawLine(p2, p3, color);
        this.drawLine(p3, p0, color);
    }

    /**
     * Adds vetex data for rendering a colored circle
     * @param transform transform of the circle
     * @param color color of the circle
     * @param thickness refers to how thick the circle is, 
     * thickness = 0.0 will produce a non-filled circle, 
     * thickness = 0.5 will produce a ring with half-radius size,
     * thickness = 1.0 will produce a filled circle.
     * @param fade can be though of as the opacity of the circle
     */
    static drawCircle(transform: TransformComponent, color: Color, thickness: number = 1.0, fade: number = 0.0) {

        let t = transform.getTransform();

        for (let i = 0; i < 4; i++) {
            this.circleVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[i]);
            this.circleVertex.fragCoord = Render2DData.CircleFragCoords[i];
            this.circleVertex.color = color;
            this.circleVertex.thickness = thickness;
            this.circleVertex.fade = fade;
    
            Render2DData.CircleVertexBuffer.addVertex(Render2DData.CircleVertexCount, this.circleVertex.flat());
            Render2DData.CircleVertexCount++;
        }

        Render2DData.CircleIndexCount += 6;
    }

    /**
     * Adds vertex data for rendering strings/(texts).
     * TODO: right now, text is rendered through a texture atlas, in the future read the information from a font (.ttf) file.
     * @param transform transform of the text
     * @param text the string to be rendered
     * @param font the font to be used.
     * Font.defaultFont consists of these characters: abcdefghijklmnopqrstuvwxyz123456789-*!?
     */
    static drawText(transform: TransformComponent, text: string, font: Font = Font.defaultFont) {

        if (!text) {
            return;
        }

        text = text.toLowerCase();

        this.tempTransform.setPosition( transform.getPosition() );
        this.tempTransform.setRotation( transform.getRotation() );
        this.tempTransform.setScale( transform.getScale() );

        for (let i = 0; i < text.length; i++) {

            const glyph = font.glyphs[text.charAt(i)];

            if (glyph) {
                this.drawSubTextureQuad(this.tempTransform, glyph);
            } 
            this.tempTransform.translate(font.glyphData.spaceWidth, 0, 0);
        }

    }

    // following functions only exist within the engine, once the game is built they shouldn't be called
    static resetStats() {
        Renderer2D.Stats.BatchCount = 0;
        Renderer2D.Stats.QuadCount = 0;
    }
}
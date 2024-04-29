import { IndexBuffer, VertexBuffer } from "./Buffer.ts"
import { Color } from "./Color.ts"
import { Shader } from "./Shader.ts"
import { Texture } from "./Texture.ts"
import { gl } from "./WebGLContext.ts"
import { Mat4, Vec2, Vec3, Vec4 } from "../math/MV.ts"
import { SubTexture, TransformComponent } from "../banana.js"

class Render2DData
{
    // scene data
    static ViewProj: Mat4 = null;

    // quads
    static MaxQuads = 10000;
    static MaxVertices = Render2DData.MaxQuads * 4;
    static MaxIndices = Render2DData.MaxQuads * 6; 
    static QuadVertexPositions = [
        new Vec4(-50, -50, 0, 1),
        new Vec4(50, -50, 0, 1),
        new Vec4(-50, 50, 0, 1),
        new Vec4(50, 50, 0, 1)
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
    static CircleIndexBuffer: IndexBuffer = null;
    static CircleVertexBuffer: VertexBuffer = null;

    static CircleFragCoords = [
        new Vec2(-1, -1),
        new Vec2(1, -1),
        new Vec2(-1, 1),
        new Vec2(-1, -1),
    ];
};

function QuadVertex() {
    this.position = null; // 4
    this.texCoord = null; // 2
    this.texIndex = null; // 1
    this.color    = null; // 4

    this.flat = function() {
        let flatArray = [];

        flatArray[0] = this.position.x;
        flatArray[1] = this.position.y;
        flatArray[2] = this.position.z;
        flatArray[3] = this.position.w;

        flatArray[4] = this.texCoord.x;
        flatArray[5] = this.texCoord.y;

        flatArray[6] = this.texIndex;

        flatArray[7] = this.color.x;
        flatArray[8] = this.color.y;
        flatArray[9] = this.color.z;
        flatArray[10] = this.color.w;

        return flatArray;
    }

}

QuadVertex.VertexSize = 11;

function LineVertex() {
    this.position = null;
    this.color    = null;

    this.flat = function() {
        let flatArray = [];

        flatArray[0] = this.position.x;
        flatArray[1] = this.position.y;
        flatArray[2] = this.position.z;
        flatArray[3] = this.position.w;

        flatArray[4] = this.color.x;
        flatArray[5] = this.color.y;
        flatArray[6] = this.color.z;
        flatArray[7] = this.color.w;

        return flatArray;
    }
}

LineVertex.VertexSize = 8;

function CircleVertex() {
    this.position  = null;
    this.fragCoord = null;
    this.color     = null;
    this.thickness = null;
    this.fade      = null;

    this.flat = function() {
        let flatArray = [];

        flatArray[0] = this.position.x;
        flatArray[1] = this.position.y;
        flatArray[2] = this.position.z;
        flatArray[3] = this.position.w;

        flatArray[4] = this.fragCoord.x;
        flatArray[5] = this.fragCoord.y;

        flatArray[6] = this.color.x;
        flatArray[7] = this.color.y;
        flatArray[8] = this.color.z;
        flatArray[9] = this.color.w;

        flatArray[10] = this.thickness;
        
        flatArray[11] = this.fade;

        return flatArray;
    }
}

CircleVertex.VertexSize = 12;

export class Renderer2D {
    static White_Texture: Texture;
    static viewProj = new Mat4();
    static quadVertex = new QuadVertex();
    static lineVertex = new LineVertex();
    static circleVertex = new CircleVertex();
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
        Renderer2D.White_Texture = new Texture();

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

        Render2DData.LineShader = new Shader('/shader/Renderer2D_Line.glsl');

        Render2DData.LineVertexBuffer = new VertexBuffer(Render2DData.MaxVertices * LineVertex.VertexSize);
        
        const aLinePosition = Render2DData.LineShader.getAttributeLocation('a_Position');
        const aLineColor = Render2DData.LineShader.getAttributeLocation('a_Color');
     
        Render2DData.LineVertexBuffer.pushAttribute(aLinePosition, 4);
        Render2DData.LineVertexBuffer.pushAttribute(aLineColor, 4);

        Render2DData.CircleShader = new Shader('/shader/Renderer2D_Circle.glsl');

        Render2DData.CircleVertexBuffer = new VertexBuffer(Render2DData.MaxVertices * CircleVertex.VertexSize);
        //Render2DData.CircleIndexBuffer = new IndexBuffer( quadIndices );

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

    static beginScene(camera, transform?: Mat4) {
        Renderer2D.newBatch();

        if (typeof transform == 'undefined') {
            // Render2DData.QuadShader.setUniformMatrix4fv('u_ViewProjectionMatrix', camera.getViewProjectionMatrix().data);
            // Render2DData.LineShader.setUniformMatrix4fv('u_ViewProjectionMatrix', camera.getViewProjectionMatrix().data);
        
            Render2DData.ViewProj = camera.getViewProjectionMatrix();
        }
        else {
            this.viewProj.identity();
            this.viewProj.mul(camera.getViewProjectionMatrix());
            this.viewProj.mul(transform.invert());
            //Render2DData.QuadShader.setUniformMatrix4fv('u_ViewProjectionMatrix', this.viewProj.data);
            //Render2DData.LineShader.setUniformMatrix4fv('u_ViewProjectionMatrix', this.viewProj.data);
        
            Render2DData.ViewProj = this.viewProj;
        }

    }

    static endScene() {        
        Renderer2D.flush();
    }

    static flush() {
        if (Render2DData.QuadIndexCount) {

            for (let i = 0; i < Render2DData.TextureSlotIndex; i++) {
                Render2DData.TextureSlots[i].bind(i);
            }

            Render2DData.QuadShader.bind();
            Render2DData.QuadVertexBuffer.bind();
            Render2DData.QuadVertexBuffer.linkAttributes();
            Render2DData.QuadShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);
            
            gl.drawElements(gl.TRIANGLES, Render2DData.QuadIndexCount, gl.UNSIGNED_SHORT, 0);
            Renderer2D.Stats.BatchCount++;
        }
        if (Render2DData.LineVertexCount) {
            
            Render2DData.LineVertexBuffer.bind();
            Render2DData.LineVertexBuffer.linkAttributes();
            Render2DData.LineShader.bind();
            Render2DData.LineShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);
    
            gl.drawArrays(gl.LINES, 0, Render2DData.LineVertexCount);
            Renderer2D.Stats.BatchCount++;
        }
        if (Render2DData.CircleIndexCount) {

            Render2DData.CircleVertexBuffer.bind();
            Render2DData.CircleVertexBuffer.linkAttributes();
            Render2DData.CircleShader.bind();
            Render2DData.CircleShader.setUniformMatrix4fv('u_ViewProjectionMatrix', Render2DData.ViewProj.data);

            gl.drawElements(gl.TRIANGLES, Render2DData.CircleIndexCount, gl.UNSIGNED_SHORT, 0);
        }
    }

    static newBatch() {
        Render2DData.QuadIndexCount = 0;
        Render2DData.QuadVertexCount = 0;

        Render2DData.LineVertexCount = 0;

        Render2DData.CircleIndexCount = 0;
        Render2DData.CircleVertexCount = 0;

        Render2DData.TextureSlotIndex = 1;
    }

    static drawColorQuad(transform: TransformComponent, color: Color) {

        Renderer2D.newBatch();
        if (Render2DData.QuadIndexCount >= Render2DData.MaxIndices) {
            Renderer2D.flush();
        }

        let t = transform.getTransform();

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[0]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[0];
        this.quadVertex.texIndex = 0;
        this.quadVertex.color = color;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[1]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[1];
        this.quadVertex.texIndex = 0;
        this.quadVertex.color = color;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[2]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[2];
        this.quadVertex.texIndex = 0;
        this.quadVertex.color = color;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[3]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[3];
        this.quadVertex.texIndex = 0;
        this.quadVertex.color = color;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;
        
        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

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

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[0]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[0];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[1]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[1];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[2]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[2];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[3]);
        this.quadVertex.texCoord = Render2DData.QuadTextureCoords[3];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

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

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[0]);
        this.quadVertex.texCoord = texCoords[0];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[1]);
        this.quadVertex.texCoord = texCoords[1];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[2]);
        this.quadVertex.texCoord = texCoords[2];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        this.quadVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[3]);
        this.quadVertex.texCoord = texCoords[3];
        this.quadVertex.texIndex = useTextureSlot;
        this.quadVertex.color = Color.TRANSPARENT;
        Render2DData.QuadVertexBuffer.addVertex(Render2DData.QuadVertexCount, this.quadVertex.flat());
        Render2DData.QuadVertexCount++;

        Render2DData.QuadIndexCount += 6;

        Renderer2D.Stats.QuadCount++;
    }

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

    static drawCircle(transform: TransformComponent, color: Color, thickness: number = 1.0, fade: number = 0.0) {

        let t = transform.getTransform();
        
        this.circleVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[0]);
        this.circleVertex.fragCoord = Render2DData.CircleFragCoords[0];
        this.circleVertex.color = color;
        this.circleVertex.thickness = thickness;
        this.circleVertex.fade = fade;

        Render2DData.CircleVertexBuffer.addVertex(Render2DData.CircleVertexCount, this.circleVertex.flat());
        Render2DData.CircleVertexCount++;

        this.circleVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[1]);
        this.circleVertex.fragCoord = Render2DData.CircleFragCoords[1];
        this.circleVertex.color = color;
        this.circleVertex.thickness = thickness;
        this.circleVertex.fade = fade;

        Render2DData.CircleVertexBuffer.addVertex(Render2DData.CircleVertexCount, this.circleVertex.flat());
        Render2DData.CircleVertexCount++;

        this.circleVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[2]);
        this.circleVertex.fragCoord = Render2DData.CircleFragCoords[2];
        this.circleVertex.color = color;
        this.circleVertex.thickness = thickness;
        this.circleVertex.fade = fade;

        Render2DData.CircleVertexBuffer.addVertex(Render2DData.CircleVertexCount, this.circleVertex.flat());
        Render2DData.CircleVertexCount++;

        this.circleVertex.position = t.mulVec4(Render2DData.QuadVertexPositions[3]);
        this.circleVertex.fragCoord = Render2DData.CircleFragCoords[3];
        this.circleVertex.color = color;
        this.circleVertex.thickness = thickness;
        this.circleVertex.fade = fade;

        Render2DData.CircleVertexBuffer.addVertex(Render2DData.CircleVertexCount, this.circleVertex.flat());
        Render2DData.CircleVertexCount++;

        Render2DData.CircleIndexCount += 6;
    }

    // following functions only exist within the engine, once the game is built they shouldn't be called
    static resetStats() {
        Renderer2D.Stats.BatchCount = 0;
        Renderer2D.Stats.QuadCount = 0;
    }
}
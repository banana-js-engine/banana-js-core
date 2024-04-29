import { gl } from "./WebGLContext.ts"

class VertexAttribute {

    location: number;
    count: number;
    normalized: boolean;

    constructor(location, count, normalized) {
        this.location = location;
        this.count = count;
        this.normalized = normalized;
    }

}

export class VertexBuffer {
    
    bufferId: number;
    data: Float32Array;
    usage: number;

    offset: number;
    stride: number;
    attributes: VertexAttribute[];
    
    constructor(data: number) {
        this.bufferId = gl.createBuffer();
        
        this.data = new Float32Array( data );
        this.usage = gl.DYNAMIC_DRAW;

        this.bind();
        
        // attribute related properties
        this.offset = 0;
        this.stride = 0;
        this.attributes = [];
    }

    bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, this.usage);
    }

    unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    addVertex(index: number, vertex) {
        for (let i = 0; i < vertex.length; i++) 
        {
            this.data[index * vertex.length + i] = vertex[i];
        }
    }

    pushAttribute(attribLocation, count, normalized = false) {
        this.attributes.push(new VertexAttribute(attribLocation, count, normalized));

        this.stride += 4 * count;
    }

    linkAttributes() {
        this.attributes.forEach(attribute => {   
            gl.enableVertexAttribArray(attribute.location);
            gl.vertexAttribPointer(attribute.location, attribute.count, gl.FLOAT, attribute.normalized, this.stride, this.offset);

            this.offset += 4 * attribute.count;
        });

        this.offset = 0;
    }

    getAttributeCount() {
        return this.attributes.length;
    }
}

export class IndexBuffer {
    bufferId: number;
    data: Uint16Array;

    constructor(data: Uint16Array) {
        this.bufferId = gl.createBuffer();
        this.data = data;
        this.bind();
    }

    bind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferId);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
    }

    unbind() {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    getCount() {
        return this.data.length;
    }
}
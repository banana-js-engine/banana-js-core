// VECTORS
export class Utils {
    static toRadians(x: number): number {
        return x * (Math.PI / 180);
    }

    static toDegrees(x: number): number {
        return x * (180 / Math.PI);
    }
}

export class Vec2 {

    static readonly ZERO = new Vec2(0, 0);
    static readonly UP = new Vec2(0, -1);
    static readonly DOWN = new Vec2(0, 1);
    static readonly RIGHT = new Vec2(1, 0);
    static readonly LEFT = new Vec2(-1, 0);

    data: Float32Array;

    constructor(x: number, y: number) {
        this.data = new Float32Array(2);

        this.data[0] = x;
        this.data[1] = y;
    }

    public get x() {
        return this.data[0];
    }

    public set x(x) {
        this.data[0] = x;
    }

    public get y() {
        return this.data[1];
    }

    public set y(y) {
        this.data[1] = y;
    }

    public add(v: Vec2) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    public length(): number {
        return Math.sqrt( this.x ** 2 + this.y ** 2 );
    }

    public distanceTo(v: Vec2): number {
        return Math.sqrt( (this.x - v.x) ** 2 + (this.y - v.y) ** 2 );
    }

    public normalize(): Vec2 {
        const len = this.length();
        return new Vec2(this.x / len, this.y / len);
    }

    public dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y; 
    }

    public cross(v: Vec2): number {
        return this.x * v.y - this.y * v.x;
    }

    public equals(other: Vec2): boolean {
        return this.x == other.x && this.y == other.y;
    }
}

export class Vec3 {
    data: Float32Array;

    constructor(x: number, y: number, z: number) {
        this.data = new Float32Array(3);

        this.data[0] = x;
        this.data[1] = y;
        this.data[2] = z;
    }

    static copy(other: Vec3) {
        return new Vec3(other.x, other.y, other.z);
    }

    public get x() {
        return this.data[0];
    }

    public set x(x) {
        this.data[0] = x;
    }

    public get y() {
        return this.data[1];
    }

    public set y(y) {
        this.data[1] = y;
    }

    public get z() {
        return this.data[2];
    }

    public set z(z) {
        this.data[2] = z;
    }

    public equals(other: Vec3): boolean {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }

    toString() {
        return `[${this.x}, ${this.y}, ${this.z}]`;
    }
}

export class Vec4 {
    data: Float32Array;

    constructor(x: number, y: number, z: number, w: number) {
        this.data = new Float32Array(4);

        this.data[0] = x;
        this.data[1] = y;
        this.data[2] = z;
        this.data[3] = w;
    }

    public get x() {
        return this.data[0];
    }

    public set x(x) {
        this.data[0] = x;
    }

    public get y() {
        return this.data[1];
    }

    public set y(y) {
        this.data[1] = y;
    }

    public get z() {
        return this.data[2];
    }

    public set z(z) {
        this.data[2] = z;
    }

    public get w() {
        return this.data[3];
    }

    public set w(w) {
        this.data[3] = w;
    }

    public equals(other: Vec4): boolean {
        return this.x == other.x && this.y == other.y && this.z == other.z && this.w == other.w;
    }

    toString() {
        return `[${this.x}, ${this.y}, ${this.y}, ${this.w}]`;
    }
}

export class Mat4 {
    data: Float32Array;
    offset: number;

    static mat4_multiply: CallableFunction;
    static mat4_apply_rotation_z: CallableFunction;
    static mat4_apply_scale: CallableFunction;
    static memory: WebAssembly.Memory;
    static currentOffset: number = 0;

    constructor() {
        if (Mat4.memory != null) {

            if (Mat4.currentOffset > 50000) {
                Mat4.currentOffset = 1024;
            }

            this.offset = Mat4.currentOffset;
            this.data = new Float32Array(Mat4.memory.buffer, this.offset, 16);
            this.identity();

            Mat4.currentOffset += 16 * Float32Array.BYTES_PER_ELEMENT;
            return;
        }

        this.data = new Float32Array(16);
        this.offset = -1;
        this.identity();
    }

    static init() {
        let memory = new WebAssembly.Memory({
            initial: 256,
            maximum: 512,
        }); 

        const importObject: WebAssembly.Imports = {
            env: {
                memory: memory,
                emscripten_resize_heap: memory.grow,
            },
            js: {
                mem: memory,
            }
        }

        WebAssembly.instantiateStreaming(fetch('./matrix.wasm'), importObject).then(
            (obj) => {
                this.mat4_multiply = obj.instance.exports.mat4_multiply as CallableFunction;
                this.mat4_apply_rotation_z = obj.instance.exports.mat4_apply_rotation_z as CallableFunction;
                this.mat4_apply_scale = obj.instance.exports.mat4_apply_scale as CallableFunction;
                this.memory = obj.instance.exports.memory as WebAssembly.Memory;
            },
        );
    }

    static fromArray(array: Float32Array) {
        const mat = new Mat4();

        for (let i = 0; i < 16; i++) {
            mat.data[i] = array[i];
        }

        return mat;
    }

    equal(other: Mat4): boolean {
        let flag = true;

        for (let i = 0; i < 16; i++) {
            if (this.data != other.data) {
                flag = false;
            }
        }

        return flag;
    }

    zero(): Mat4 {
        this.data.fill(0);
        return this;
    }

    identity(): Mat4 {
        this.data.fill(0);
        this.data[0] = 1;
        this.data[5] = 1;
        this.data[10] = 1;
        this.data[15] = 1;
        return this;
    }

    mul(other: Mat4): Mat4 {
        if (Mat4.memory != null) {
            return this.mulSIMD(other);
        }

        var nm00 = this.data[ 0] * other.data[ 0] + this.data[ 4] * other.data[ 1] + this.data[ 8] * other.data[ 2] + this.data[12] * other.data[ 3];
        var nm01 = this.data[ 1] * other.data[ 0] + this.data[ 5] * other.data[ 1] + this.data[ 9] * other.data[ 2] + this.data[13] * other.data[ 3];
        var nm02 = this.data[ 2] * other.data[ 0] + this.data[ 6] * other.data[ 1] + this.data[10] * other.data[ 2] + this.data[14] * other.data[ 3];
        var nm03 = this.data[ 3] * other.data[ 0] + this.data[ 7] * other.data[ 1] + this.data[11] * other.data[ 2] + this.data[15] * other.data[ 3];
        var nm10 = this.data[ 0] * other.data[ 4] + this.data[ 4] * other.data[ 5] + this.data[ 8] * other.data[ 6] + this.data[12] * other.data[ 7];
        var nm11 = this.data[ 1] * other.data[ 4] + this.data[ 5] * other.data[ 5] + this.data[ 9] * other.data[ 6] + this.data[13] * other.data[ 7];
        var nm12 = this.data[ 2] * other.data[ 4] + this.data[ 6] * other.data[ 5] + this.data[10] * other.data[ 6] + this.data[14] * other.data[ 7];
        var nm13 = this.data[ 3] * other.data[ 4] + this.data[ 7] * other.data[ 5] + this.data[11] * other.data[ 6] + this.data[15] * other.data[ 7];
        var nm20 = this.data[ 0] * other.data[ 8] + this.data[ 4] * other.data[ 9] + this.data[ 8] * other.data[10] + this.data[12] * other.data[11];
        var nm21 = this.data[ 1] * other.data[ 8] + this.data[ 5] * other.data[ 9] + this.data[ 9] * other.data[10] + this.data[13] * other.data[11];
        var nm22 = this.data[ 2] * other.data[ 8] + this.data[ 6] * other.data[ 9] + this.data[10] * other.data[10] + this.data[14] * other.data[11];
        var nm23 = this.data[ 3] * other.data[ 8] + this.data[ 7] * other.data[ 9] + this.data[11] * other.data[10] + this.data[15] * other.data[11];
        var nm30 = this.data[ 0] * other.data[12] + this.data[ 4] * other.data[13] + this.data[ 8] * other.data[14] + this.data[12] * other.data[15];
        var nm31 = this.data[ 1] * other.data[12] + this.data[ 5] * other.data[13] + this.data[ 9] * other.data[14] + this.data[13] * other.data[15];
        var nm32 = this.data[ 2] * other.data[12] + this.data[ 6] * other.data[13] + this.data[10] * other.data[14] + this.data[14] * other.data[15];
        var nm33 = this.data[ 3] * other.data[12] + this.data[ 7] * other.data[13] + this.data[11] * other.data[14] + this.data[15] * other.data[15];
        this.data[ 0] = nm00;
        this.data[ 1] = nm01;
        this.data[ 2] = nm02;
        this.data[ 3] = nm03;
        this.data[ 4] = nm10;
        this.data[ 5] = nm11;
        this.data[ 6] = nm12;
        this.data[ 7] = nm13;
        this.data[ 8] = nm20;
        this.data[ 9] = nm21;
        this.data[10] = nm22;
        this.data[11] = nm23;
        this.data[12] = nm30;
        this.data[13] = nm31;
        this.data[14] = nm32;
        this.data[15] = nm33;

        return this;
    }

    mulSIMD(other: Mat4): Mat4 {

        // corner case
        if (this.offset == -1) {

            if (Mat4.currentOffset > 65536) {
                Mat4.currentOffset = 1024;
            }

            const a = new Float32Array(this.data);

            this.offset = Mat4.currentOffset;
            this.data = new Float32Array(Mat4.memory.buffer, this.offset, 16);
            this.data.set(a);

            Mat4.currentOffset += 16 * Float32Array.BYTES_PER_ELEMENT;
        }

        if (other.offset == -1) {

            if (Mat4.currentOffset > 65536) {
                Mat4.currentOffset = 1024;
            }

            const a = new Float32Array(other.data);

            other.offset = Mat4.currentOffset;
            other.data = new Float32Array(Mat4.memory.buffer, other.offset, 16);
            other.data.set(a);

            Mat4.currentOffset += 16 * Float32Array.BYTES_PER_ELEMENT;
        }

        Mat4.mat4_multiply(this.offset, other.offset);

        return this;
    }

    mulVec4(vec4: Vec4): Vec4 {
        let result = new Vec4(0, 0, 0, 0);

        for (let i = 0; i < 4; i++) {
            result.data[i] = this.data[i * 4] * vec4.x + this.data[i * 4 + 1] * vec4.y + this.data[i * 4 + 2] * vec4.z + this.data[i * 4 + 3] * vec4.w;
        }

        result.w = 1.0

        return result;
    }

    transpose(): Mat4 {
        var nm00 = this.data[ 0];
        var nm01 = this.data[ 4];
        var nm02 = this.data[ 8];
        var nm03 = this.data[12];
        var nm10 = this.data[ 1];
        var nm11 = this.data[ 5];
        var nm12 = this.data[ 9];
        var nm13 = this.data[13];
        var nm20 = this.data[ 2];
        var nm21 = this.data[ 6];
        var nm22 = this.data[10];
        var nm23 = this.data[14];
        var nm30 = this.data[ 3];
        var nm31 = this.data[ 7];
        var nm32 = this.data[11];
        var nm33 = this.data[15];
        this.data[ 0] = nm00;
        this.data[ 1] = nm01;
        this.data[ 2] = nm02;
        this.data[ 3] = nm03;
        this.data[ 4] = nm10;
        this.data[ 5] = nm11;
        this.data[ 6] = nm12;
        this.data[ 7] = nm13;
        this.data[ 8] = nm20;
        this.data[ 9] = nm21;
        this.data[10] = nm22;
        this.data[11] = nm23;
        this.data[12] = nm30;
        this.data[13] = nm31;
        this.data[14] = nm32;
        this.data[15] = nm33;

        return this;
    }

    invert(): Mat4 {
        const a = this.data[ 0] * this.data[ 5] - this.data[ 1] * this.data[ 4];
        const b = this.data[ 0] * this.data[ 6] - this.data[ 2] * this.data[ 4];
        const c = this.data[ 0] * this.data[ 7] - this.data[ 3] * this.data[ 4];
        const d = this.data[ 1] * this.data[ 6] - this.data[ 2] * this.data[ 5];
        const e = this.data[ 1] * this.data[ 7] - this.data[ 3] * this.data[ 5];
        const f = this.data[ 2] * this.data[ 7] - this.data[ 3] * this.data[ 6];
        const g = this.data[ 8] * this.data[13] - this.data[ 9] * this.data[12];
        const h = this.data[ 8] * this.data[14] - this.data[10] * this.data[12];
        const i = this.data[ 8] * this.data[15] - this.data[11] * this.data[12];
        const j = this.data[ 9] * this.data[14] - this.data[10] * this.data[13];
        const k = this.data[ 9] * this.data[15] - this.data[11] * this.data[13];
        const l = this.data[10] * this.data[15] - this.data[11] * this.data[14];
        let det = a * l - b * k + c * j + d * i - e * h + f * g;
        det = 1.0 / det;
        
        const nm00 = ( this.data[ 5] * l - this.data[ 6] * k + this.data[ 7] * j) * det;
        const nm01 = (-this.data[ 1] * l + this.data[ 2] * k - this.data[ 3] * j) * det;
        const nm02 = ( this.data[13] * f - this.data[14] * e + this.data[15] * d) * det;
        const nm03 = (-this.data[ 9] * f + this.data[10] * e - this.data[11] * d) * det;
        const nm10 = (-this.data[ 4] * l + this.data[ 6] * i - this.data[ 7] * h) * det;
        const nm11 = ( this.data[ 0] * l - this.data[ 2] * i + this.data[ 3] * h) * det;
        const nm12 = (-this.data[12] * f + this.data[14] * c - this.data[15] * b) * det;
        const nm13 = ( this.data[ 8] * f - this.data[10] * c + this.data[11] * b) * det;
        const nm20 = ( this.data[ 4] * k - this.data[ 5] * i + this.data[ 7] * g) * det;
        const nm21 = (-this.data[ 0] * k + this.data[ 1] * i - this.data[ 3] * g) * det;
        const nm22 = ( this.data[12] * e - this.data[13] * c + this.data[15] * a) * det;
        const nm23 = (-this.data[ 8] * e + this.data[ 9] * c - this.data[11] * a) * det;
        const nm30 = (-this.data[ 4] * j + this.data[ 5] * h - this.data[ 6] * g) * det;
        const nm31 = ( this.data[ 0] * j - this.data[ 1] * h + this.data[ 2] * g) * det;
        const nm32 = (-this.data[12] * d + this.data[13] * b - this.data[14] * a) * det;
        const nm33 = ( this.data[ 8] * d - this.data[ 9] * b + this.data[10] * a) * det;

        this.data[ 0] = nm00;
        this.data[ 1] = nm01;
        this.data[ 2] = nm02;
        this.data[ 3] = nm03;
        this.data[ 4] = nm10;
        this.data[ 5] = nm11;
        this.data[ 6] = nm12;
        this.data[ 7] = nm13;
        this.data[ 8] = nm20;
        this.data[ 9] = nm21;
        this.data[10] = nm22;
        this.data[11] = nm23;
        this.data[12] = nm30;
        this.data[13] = nm31;
        this.data[14] = nm32;
        this.data[15] = nm33;
        return this;
    }

    invertSIMD(): Mat4 {

        return null;
    }

    setTranslation(vec3: Vec3): Mat4 {
        this.identity();
        this.data[3] = vec3.x;
        this.data[7] = vec3.y;
        this.data[11] = vec3.z;
        return this;
    }

    applyRotationZ(ang: number): Mat4 {
        ang = Utils.toRadians(ang);

        const cos = Math.cos(ang);
        const sin = Math.sin(ang);

        if (Mat4.memory != null) {
            return this.applyRotationZSIMD(cos, sin);
        }

        const rm00 = cos;
        const rm01 = -sin;
        const rm10 = sin;
        const rm11 = cos;
    
        const nm00 = this.data[0] * rm00 + this.data[4] * rm01;
        const nm01 = this.data[1] * rm00 + this.data[5] * rm01;
        const nm02 = this.data[2] * rm00 + this.data[6] * rm01;
        const nm03 = this.data[3] * rm00 + this.data[7] * rm01;
    
        this.data[4] = this.data[0] * rm10 + this.data[4] * rm11;
        this.data[5] = this.data[1] * rm10 + this.data[5] * rm11;
        this.data[6] = this.data[2] * rm10 + this.data[6] * rm11;
        this.data[7] = this.data[3] * rm10 + this.data[7] * rm11;
    
        this.data[0] = nm00;
        this.data[1] = nm01;
        this.data[2] = nm02;
        this.data[3] = nm03;
    
        return this;
    }

    applyRotationZSIMD(cos: number, sin: number) {

        // corner case
        if (this.offset == -1) {

            if (Mat4.currentOffset > 65536) {
                Mat4.currentOffset = 1024;
            }

            const a = new Float32Array(this.data);

            this.offset = Mat4.currentOffset;
            this.data = new Float32Array(Mat4.memory.buffer, this.offset, 16);
            this.data.set(a);

            Mat4.currentOffset += 16 * Float32Array.BYTES_PER_ELEMENT;
        }

        Mat4.mat4_apply_rotation_z(this.offset, cos, sin);

        return this;
    }

    applyScale(vec3: Vec3): Mat4 {

        if (Mat4.memory != null) {
            return this.applyScaleSIMD(vec3.x, vec3.y, vec3.z);
        }

        this.data[ 0] = this.data[ 0] * vec3.x;
        this.data[ 1] = this.data[ 1] * vec3.x;
        this.data[ 2] = this.data[ 2] * vec3.x;
        this.data[ 3] = this.data[ 3] * vec3.x;
        this.data[ 4] = this.data[ 4] * vec3.y;
        this.data[ 5] = this.data[ 5] * vec3.y;
        this.data[ 6] = this.data[ 6] * vec3.y;
        this.data[ 7] = this.data[ 7] * vec3.y;
        this.data[ 8] = this.data[ 8] * vec3.z;
        this.data[ 9] = this.data[ 9] * vec3.z;
        this.data[10] = this.data[10] * vec3.z;
        this.data[11] = this.data[11] * vec3.z;

        return this;
    }

    applyScaleSIMD(x: number, y: number, z: number) {

        // corner case
        if (this.offset == -1) {

            if (Mat4.currentOffset > 65536) {
                Mat4.currentOffset = 1024;
            }

            const a = new Float32Array(this.data);

            this.offset = Mat4.currentOffset;
            this.data = new Float32Array(Mat4.memory.buffer, this.offset, 16);
            this.data.set(a);

            Mat4.currentOffset += 16 * Float32Array.BYTES_PER_ELEMENT;
        }

        Mat4.mat4_apply_scale(this.offset, x, y, z);

        return this;
    }

    applyPerspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
        const h = Math.tan(fovy * 0.5);
		
        // calculate right matrix elements
        const rm00 = 1.0 / (h * aspect);
        const rm11 = 1.0 / h;
        let rm22;
        let rm32;
        
        const zZeroToOne = false;
        rm22 = (zZeroToOne ? far : far + near) / (near - far);
        rm32 = (zZeroToOne ? far : far + far) * near / (near - far);
      
        // perform optimized matrix multiplication
        const nm20 = this.data[ 8] * rm22 - this.data[12];
        const nm21 = this.data[ 9] * rm22 - this.data[13];
        const nm22 = this.data[10] * rm22 - this.data[14];
        const nm23 = this.data[11] * rm22 - this.data[15];
        this.data[ 0] = this.data[ 0] * rm00;
        this.data[ 1] = this.data[ 1] * rm00;
        this.data[ 2] = this.data[ 2] * rm00;
        this.data[ 3] = this.data[ 3] * rm00;
        this.data[ 4] = this.data[ 4] * rm11;
        this.data[ 5] = this.data[ 5] * rm11;
        this.data[ 6] = this.data[ 6] * rm11;
        this.data[ 7] = this.data[ 7] * rm11;
        this.data[12] = this.data[ 8] * rm32;
        this.data[13] = this.data[ 9] * rm32;
        this.data[14] = this.data[10] * rm32;
        this.data[15] = this.data[11] * rm32;
        this.data[ 8] = nm20;
        this.data[ 9] = nm21;
        this.data[10] = nm22;
        this.data[11] = nm23;
        return this;
    }

    setPerspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
        this.identity();
        this.applyPerspective(fovy, aspect, near, far);
        return this;
    }

    applyOrtho(left, right, bottom, top, near, far): Mat4 {
        // calculate right matrix elements
        const rm00 = 2.0 / (right - left);
        const rm11 = 2.0 / (top - bottom);
        const rm22 = 2.0 / (near - far);
        const rm30 = (left + right) / (left - right);
        const rm31 = (top + bottom) / (bottom - top);
        const rm32 = (far + near) / (near - far);
        
        // perform optimized multiplication
        // compute the last column first, because other columns do not depend on it
        this.data[12] = this.data[ 0] * rm30 + this.data[ 4] * rm31 + this.data[ 8] * rm32 + this.data[12];
        this.data[13] = this.data[ 1] * rm30 + this.data[ 5] * rm31 + this.data[ 9] * rm32 + this.data[13];
        this.data[14] = this.data[ 2] * rm30 + this.data[ 6] * rm31 + this.data[10] * rm32 + this.data[14];
        this.data[15] = this.data[ 3] * rm30 + this.data[ 7] * rm31 + this.data[11] * rm32 + this.data[15];
        this.data[ 0] = this.data[ 0] * rm00;
        this.data[ 1] = this.data[ 1] * rm00;
        this.data[ 2] = this.data[ 2] * rm00;
        this.data[ 3] = this.data[ 3] * rm00;
        this.data[ 4] = this.data[ 4] * rm11;
        this.data[ 5] = this.data[ 5] * rm11;
        this.data[ 6] = this.data[ 6] * rm11;
        this.data[ 7] = this.data[ 7] * rm11;
        this.data[ 8] = this.data[ 8] * rm22;
        this.data[ 9] = this.data[ 9] * rm22;
        this.data[10] = this.data[10] * rm22;
        this.data[11] = this.data[11] * rm22;
        
        return this;
    }

    setOrtho(left, right, bottom, top, near, far): Mat4 {
        this.identity();
        this.applyOrtho(left, right, bottom, top, near, far);
        return this;
    }

    static translate(vec: Vec3) {

    }
}

import { Vec4 } from '../math/MV.ts';

export class Color
{
    static BLACK = new Vec4(0.0, 0.0, 0.0, 1.0);
    static RED = new Vec4(1.0, 0.0, 0.0, 1.0);
    static GREEN = new Vec4(0.0, 1.0, 0.0, 1.0);
    static BLUE = new Vec4(0.0, 0.0, 1.0, 1.0);
    static PURPLE = new Vec4(0.5, 0.0, 0.5, 1.0);
    static YELLOW = new Vec4(1.0, 1.0, 0.0, 1.0);
    static ORANGE = new Vec4(1.0, 0.47, 0.0, 1.0);
    static CYAN = new Vec4(0.0, 1.0, 1.0, 1.0);
    static WHITE = new Vec4(1.0, 1.0, 1.0, 1.0);
    static TRANSPARENT = new Vec4(0.0, 0.0, 0.0, 0.0);

    constructor(r: number, g: number, b: number, a: number) {    
        return new Vec4(r, g, b, a);
    }
    
}

export class Color
{
    static BLACK = new Color(0.0, 0.0, 0.0, 1.0);
    static RED = new Color(1.0, 0.0, 0.0, 1.0);
    static GREEN = new Color(0.0, 1.0, 0.0, 1.0);
    static BLUE = new Color(0.0, 0.0, 1.0, 1.0);
    static PURPLE = new Color(0.5, 0.0, 0.5, 1.0);
    static YELLOW = new Color(1.0, 1.0, 0.0, 1.0);
    static ORANGE = new Color(1.0, 0.47, 0.0, 1.0);
    static CYAN = new Color(0.0, 1.0, 1.0, 1.0);
    static WHITE = new Color(1.0, 1.0, 1.0, 1.0);
    static TRANSPARENT = new Color(0.0, 0.0, 0.0, 0.0);

    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {    
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    
}

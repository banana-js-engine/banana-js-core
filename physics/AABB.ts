import { Vec2 } from "../banana.js";

export class AABB { // axis-aligned bounding box

    min: Vec2;
    max: Vec2;

    constructor(minX: number, minY: number, maxX: number, maxY: number) {
        this.min = new Vec2(minX, minY);
        this.max = new Vec2(maxX, maxY);
    }
}
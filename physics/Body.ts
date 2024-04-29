import { Vec2, PhysicsWorld, Log } from "../banana";

enum ShapeType {
    Circle,
    Box,
}

export class Body2D {
    private _linearVelocity: Vec2;
    private _linearRotation: number;

    public readonly density: number;
    public readonly mass: number;
    public readonly restitution: number;
    public readonly area: number;

    public readonly isStatic: boolean;

    public readonly radius: number;
    public readonly width: number;
    public readonly height: number;

    public readonly shapeType: ShapeType;

    constructor(density: number, mass: number, restitution: number, area: number, isStatic: boolean, radius: number,
        width: number, height: number, shapeType: ShapeType
    ) {
        this._linearVelocity = Vec2.ZERO;
        this._linearRotation = 0;

        this.density = density;
        this.mass = mass;
        this.restitution = restitution;
        this.area = area;
        
        this.isStatic = isStatic;
        
        this.radius = radius;
        this.width = width;
        this.height = height;

        this.shapeType = shapeType;
    }

    public static CreateCircleBody2D(radius: number, density: number, isStatic: boolean, restitution: number): Body2D {
        const area = radius * radius * Math.PI;

        if (area < PhysicsWorld.minBodySize) {
            Log.Core_Warn(`Circle radius is too small. Min circle area is ${PhysicsWorld.minBodySize}`);
        }
        else if (area > PhysicsWorld.maxBodySize) {
            Log.Core_Warn(`Cirlce radius is too large. Max circle area is ${PhysicsWorld.maxBodySize}`);
        }

        return null;
    }
}
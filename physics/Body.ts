import { Vec2, PhysicsWorld, Log, Utils, TransformComponent, Vec4 } from "../banana.js";

export enum ShapeType {
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

    public readonly vertices: Vec4[];

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

        this.vertices = [];
        if (this.shapeType == ShapeType.Box) {
            this.vertices[0] = new Vec4(width / -2, height / -2, 0, 1);
            this.vertices[1] = new Vec4(width / 2, height / -2, 0, 1);
            this.vertices[2] = new Vec4(width / 2, height / 2, 0, 1);
            this.vertices[3] = new Vec4(width / -2, height / 2, 0, 1);
        }
    }

    public static CreateCircleBody2D(radius: number, density: number, isStatic: boolean, restitution: number): Body2D {
        let area = radius * radius * Math.PI;

        if (area < PhysicsWorld.minBodySize) {
            Log.Core_Warn(`Area is too small. Min area is ${PhysicsWorld.minBodySize}`);
            area = PhysicsWorld.minBodySize;
        }
        // else if (area > PhysicsWorld.maxBodySize) {
        //     Log.Core_Warn(`Area is too large. Max area is ${PhysicsWorld.maxBodySize}`);
        //     area = PhysicsWorld.maxBodySize;
        // }

        if (density < PhysicsWorld.minDensity) {
            Log.Core_Warn(`Density is too small. Min density is ${PhysicsWorld.minDensity}`);
            density = PhysicsWorld.minDensity;
        }
        else if (density > PhysicsWorld.maxDensity) {
            Log.Core_Warn(`Density is too large. Max density is ${PhysicsWorld.maxDensity}`);
            density = PhysicsWorld.maxDensity;
        }

        restitution = Utils.clamp(restitution, 0, 1);
        const mass = area * density;

        return new Body2D(density, mass, restitution, area, isStatic, radius, 0, 0, ShapeType.Circle);
    }
    
    public static CreateBoxBody2D(width: number, height: number, density: number, isStatic: boolean, restitution: number): Body2D {
        let area = width * height;

        if (area < PhysicsWorld.minBodySize) {
            Log.Core_Warn(`Area is too small. Min area is ${PhysicsWorld.minBodySize}`);
            area = PhysicsWorld.minBodySize;
        }
        // else if (area > PhysicsWorld.maxBodySize) {
        //     Log.Core_Warn(`Area is too large. Max area is ${PhysicsWorld.maxBodySize}`);
        //     area = PhysicsWorld.maxBodySize;
        // }

        if (density < PhysicsWorld.minDensity) {
            Log.Core_Warn(`Density is too small. Min density is ${PhysicsWorld.minDensity}`);
            density = PhysicsWorld.minDensity;
        }
        else if (density > PhysicsWorld.maxDensity) {
            Log.Core_Warn(`Density is too large. Max density is ${PhysicsWorld.maxDensity}`);
            density = PhysicsWorld.maxDensity;
        }

        restitution = Utils.clamp(restitution, 0, 1);
        const mass = area * density;

        return new Body2D(density, mass, restitution, area, isStatic, 0, width, height, ShapeType.Box);
    }

    public move(transform: TransformComponent) {
        transform.translate(this._linearVelocity.x, this._linearVelocity.y, 0);
    }

    public moveBy(v: Vec2, transform: TransformComponent) {
        transform.translate(v.x, v.y, 0);
    }

    public set linearVelocity(v: Vec2) {
        this._linearVelocity.x = v.x;
        this._linearVelocity.y = v.y;
    }
}
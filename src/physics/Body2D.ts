import { PhysicsWorld } from "./PhysicsWorld.js";
import { AABB } from "./AABB.js";
import { Log } from "../core/Log.js";
import { TransformComponent } from "../scene/Component.js";
import { Vec2, Vec4, Utils } from "../math/BananaMath.js"

export enum ShapeType {
    Circle,
    Box,
}

export class Body2D {
    #linearVelocity: Vec2;
    #rotationalVelocity: number;

    #force: Vec2;

    #gravityScale: number;

    density: number;
    mass: number;
    restitution: number;
    area: number;
    
    isStatic: boolean;
    
    radius: number;
    width: number;
    height: number;

    inertia: number;
    
    inverseMass: number;
    inverseInertia: number;
    
    vertices: Vec4[];

    shapeType: ShapeType;

    staticFriction: number;
    dynamicFriction: number;

    constructor(density: number, mass: number, restitution: number, area: number, isStatic: boolean, radius: number,
        width: number, height: number, inertia: number, shapeType: ShapeType
    ) {
        this.#linearVelocity = Vec2.ZERO;
        this.#rotationalVelocity = 0;

        this.#force = Vec2.ZERO;

        this.#gravityScale = 1;

        this.density = density;
        this.mass = mass;
        this.restitution = restitution;
        this.area = area;
        
        this.isStatic = isStatic;
        
        this.radius = radius;
        this.width = width;
        this.height = height;

        this.shapeType = shapeType;

        this.staticFriction = 0.6;
        this.dynamicFriction = 0.4;

        this.vertices = [];
        if (this.shapeType == ShapeType.Box) {
            this.vertices[0] = new Vec4(-width / 2, -height / 2, 0, 1);
            this.vertices[1] = new Vec4(width / 2, -height / 2, 0, 1);
            this.vertices[2] = new Vec4(width / 2, height / 2, 0, 1);
            this.vertices[3] = new Vec4(-width / 2, height / 2, 0, 1);
        }

        if (!isStatic) {
            this.inverseMass = 1 / mass;
            this.inverseInertia = 1 / inertia;
        }
        else {
            this.inverseMass = 0;
            this.inverseInertia = 0;
        }
    }

    public static CreateCircleBody2D(radius: number, density: number, isStatic: boolean, restitution: number): Body2D {
        let area = radius * radius * Math.PI;

        if (area < PhysicsWorld.minBodySize) {
            Log.Core_Warn(`Area is too small. Min area is ${PhysicsWorld.minBodySize}`);
            area = PhysicsWorld.minBodySize;
            radius = Math.sqrt(area / Math.PI);
        }
        else if (area > PhysicsWorld.maxBodySize) {
            Log.Core_Warn(`Area is too large. Max area is ${PhysicsWorld.maxBodySize}`);
            area = PhysicsWorld.maxBodySize;
            radius = Math.sqrt(area / Math.PI);
        }

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

        const inertia = 0.5 * mass * radius * radius;

        return new Body2D(density, mass, restitution, area, isStatic, radius, 1, 1, inertia, ShapeType.Circle);
    }
    
    public static CreateBoxBody2D(width: number, height: number, density: number, isStatic: boolean, restitution: number): Body2D {
        let area = width * height;

        if (area < PhysicsWorld.minBodySize) {
            Log.Core_Warn(`Area is too small. Min area is ${PhysicsWorld.minBodySize}`);
            area = PhysicsWorld.minBodySize;
            width = Math.sqrt(area);
            height = width;
        }
        else if (area > PhysicsWorld.maxBodySize) {
            Log.Core_Warn(`Area is too large. Max area is ${PhysicsWorld.maxBodySize}`);
            area = PhysicsWorld.maxBodySize;
            width = Math.sqrt(area);
            height = width;
        }

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

        const inertia = (1.0 / 12.0) * mass * (width * width + height * height);

        return new Body2D(density, mass, restitution, area, isStatic, 0.5, width, height, inertia, ShapeType.Box);
    }

    public getAABB(transform: TransformComponent): AABB {

        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        if (this.shapeType == ShapeType.Box) {
            const t = transform.getTransform();
            let v: Vec4;

            for (let i = 0; i < this.vertices.length; i++) {
                v = t.mulVec4(this.vertices[i]);

                if (v.x < minX) { minX = v.x; }
                if (v.y < minY) { minY = v.y; }
                if (v.x > maxX) { maxX = v.x; }
                if (v.y > maxY) { maxY = v.y; }
            }
        }
        else if (this.shapeType == ShapeType.Circle) {
            const position = transform.getPosition();

            minX = position.x - this.radius;
            minY = position.y - this.radius;
            maxX = position.x + this.radius;
            maxY = position.y + this.radius;
        }

        return new AABB(minX, minY, maxX, maxY);
    }

    public update(deltaTime: number, transform: TransformComponent, gravity: Vec2, iterations: number) {

        if (this.isStatic) {
            return;
        }

        const time = deltaTime / iterations;

        this.#linearVelocity = this.#linearVelocity.add(gravity.mul(this.#gravityScale).mul(time));

        this.#linearVelocity = this.#linearVelocity.add(this.#force);

        transform.translate(this.#linearVelocity.x * time, this.#linearVelocity.y * time, 0);
        transform.rotate(0, 0, Utils.toDegrees(this.#rotationalVelocity) * time);
    
        this.#force = Vec2.ZERO;
    }

    public moveBy(v: Vec2, transform: TransformComponent) {
        transform.translate(v.x, v.y, 0);
    }

    public addForce(amount: Vec2) {
        this.#force = amount;
    }

    public get linearVelocity() {
        return this.#linearVelocity;
    }

    public set linearVelocity(v: Vec2) {
        this.#linearVelocity.x = v.x;
        this.#linearVelocity.y = v.y;
    }

    public get rotationalVelocity() {
        return this.#rotationalVelocity;
    }

    public set rotationalVelocity(ang: number) {
        this.#rotationalVelocity = ang;
    }

    public get gravityScale() {
        return this.#gravityScale;
    }

    public set gravityScale(newValue: number) {
        this.#gravityScale = newValue;
    }
}
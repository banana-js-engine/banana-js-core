import { CollisionInformation, Collisions } from "./Collisions.js";
import { Body2DComponent, TransformComponent } from "../scene/Component.js";
import { ShapeType } from "./Body2D.js";
import { Vec2, Utils } from "../math/BananaMath.js"

export class PhysicsWorld {

    public static readonly minBodySize: number = 0.01 * 0.01;
    public static readonly maxBodySize: number = 1000 * 1000; 
    
    public static readonly maxDensity: number = 21.6; 
    public static readonly minDensity: number = 0.1; 

    public static readonly minIterations = 1;
    public static readonly maxIterations = 64;

    static get withRotation() {
        const cachedValue = localStorage.getItem('withRotation');
        if (cachedValue) {
            return cachedValue == 'true';
        }

        return true;
    }

    static set withRotation(newValue: boolean) {
        localStorage.setItem('withRotation', newValue.toString());
    }

    static get withFriction() {
        const cachedValue = localStorage.getItem('withFriction');
        if (cachedValue) {
            return cachedValue == 'true';
        }

        return true;
    }

    static set withFriction(newValue: boolean) {
        localStorage.setItem('withFriction', newValue.toString());
    }

    public gravity: Vec2;

    private contactList: CollisionInformation[];

    public static contactPoints = []; // for debug purposes

    constructor() {
        this.gravity = new Vec2(0, 9.81);
    
        this.contactList = [];
    }

    public update(deltaTime: number, bodyA: Body2DComponent, transformA: TransformComponent, iterations: number) {

        iterations = Utils.clamp(iterations, PhysicsWorld.minIterations, PhysicsWorld.maxIterations);

        bodyA.update(deltaTime, transformA, this.gravity, iterations);
    }

    public collide(deltaTime: number, bodyA: Body2DComponent, transformA: TransformComponent, bodyB: Body2DComponent, transformB: TransformComponent, iterations: number) {
                
        if (bodyA.body2d.isStatic && bodyB.body2d.isStatic) {
            return;
        }

        const AABB_a = bodyA.body2d.getAABB(transformA);
        const AABB_b = bodyB.body2d.getAABB(transformB);
        
        if (!Collisions.checkAABBCollision(AABB_a, AABB_b)) {
            return;
        }

        this.contactList = [];
        
        let collInfo: CollisionInformation = null;
        
        const shapeTypeA = bodyA.body2d.shapeType;
        const shapeTypeB = bodyB.body2d.shapeType;

        // TODO: Make it so that you can pass in Vec3 as Vec2.
        if (shapeTypeA == ShapeType.Circle && shapeTypeB == ShapeType.Circle) {
            collInfo = Collisions.checkCircleCollision(
                new Vec2(transformA.getPosition().x, transformA.getPosition().y),
                bodyA.radius,
                new Vec2(transformB.getPosition().x, transformB.getPosition().y),
                bodyB.radius
            );
        }
        else if (shapeTypeA == ShapeType.Box && shapeTypeB == ShapeType.Box) {
            const transformMatA = transformA.getTransform();
            const transformMatB = transformB.getTransform();

            const verticesA = [];
            const verticesB = [];

            for (let i = 0; i < 4; i++) {
                verticesA.push(transformMatA.mulVec4(bodyA.body2d.vertices[i]));
                verticesB.push(transformMatB.mulVec4(bodyB.body2d.vertices[i]));
            }

            collInfo = Collisions.checkPolygonCollision(verticesA, verticesB);
        }
        else if (shapeTypeA == ShapeType.Box && shapeTypeB == ShapeType.Circle) {
            const transformMatA = transformA.getTransform();
            const verticesA = [];
            for (let i = 0; i < 4; i++) {
                verticesA.push(transformMatA.mulVec4(bodyA.body2d.vertices[i]));
            }

            collInfo = Collisions.checkCirclePolygonCollision(
                new Vec2(transformB.getPosition().x, transformB.getPosition().y),
                bodyB.radius,
                verticesA,
            );

            collInfo.normal = collInfo.normal.mul(-1);
        }
        else if (shapeTypeA == ShapeType.Circle && shapeTypeB == ShapeType.Box) {
            const transformMatB = transformB.getTransform();
            const verticesB = [];
            for (let i = 0; i < 4; i++) {
                verticesB.push(transformMatB.mulVec4(bodyB.body2d.vertices[i]));
            }

            collInfo = Collisions.checkCirclePolygonCollision(
                new Vec2(transformA.getPosition().x, transformA.getPosition().y),
                bodyA.radius,
                verticesB,
            );
        }

        if (collInfo.isColliding) {

            if (bodyA.body2d.isStatic) {
                bodyB.moveBy(collInfo.normal.mul(collInfo.depth), transformB);
            }
            else if (bodyB.body2d.isStatic) {
                bodyA.moveBy(collInfo.normal.mul(-collInfo.depth), transformA);
            }
            else {
                bodyA.moveBy(collInfo.normal.mul(collInfo.depth).div(-2), transformA);
                bodyB.moveBy(collInfo.normal.mul(collInfo.depth).div(2), transformB);
            }
            
            collInfo.bodyA = bodyA.body2d;
            collInfo.bodyB = bodyB.body2d;
            collInfo.bodyAPos = transformA.getPosition();
            collInfo.bodyBPos = transformB.getPosition();

            

            this.contactList.push(collInfo);
        }

        this.narrowPhase();
    }

    private broadPhase() {
        // TODO
    }

    private narrowPhase() {
        for (const collInfo of this.contactList) {
            this.resolveCollision(collInfo, PhysicsWorld.withFriction, PhysicsWorld.withRotation);

            // if (collInfo.contactCount > 1) {
            //     PhysicsWorld.contactPoints.push(collInfo.contact1);
            //     PhysicsWorld.contactPoints.push(collInfo.contact2);
            // }
            // else if (collInfo.contactCount > 0) {
            //     PhysicsWorld.contactPoints.push(collInfo.contact1);
            // }
        }
    }

    private resolveCollision(collInfo: CollisionInformation, withFriction: boolean = true, withRotation: boolean = true) {
        if (withFriction && withRotation) {
            this.resolveCollisionWithRotationAndFriction(collInfo);
            return;
        }
        else if (withRotation) {
            this.resolveCollisionWithRotation(collInfo);
            return;
        }

        this.resolveCollisionBasic(collInfo);
    }

    private resolveCollisionBasic(collInfo: CollisionInformation) {

        const bodyA = collInfo.bodyA;
        const bodyB = collInfo.bodyB;

        const relativeVelocity = bodyB.linearVelocity.sub(bodyA.linearVelocity);

        if (relativeVelocity.dot(collInfo.normal) > 0) {
            return;
        }

        const e = Math.min(bodyA.restitution, bodyB.restitution);

        let j = (- 1 - e) * (relativeVelocity.dot(collInfo.normal));
        j /= bodyA.inverseMass + bodyB.inverseMass;

        const impulse = collInfo.normal.mul(j);

        bodyA.linearVelocity = bodyA.linearVelocity.sub(impulse.mul(bodyA.inverseMass));
        bodyB.linearVelocity = bodyB.linearVelocity.add(impulse.mul(bodyB.inverseMass));
    }

    private resolveCollisionWithRotation(collInfo: CollisionInformation) {
        this.resolveContactPoints(collInfo);
    }

    private resolveCollisionWithRotationAndFriction(collInfo: CollisionInformation) {

        const jList = this.resolveContactPoints(collInfo);        

        this.resolveFriction(collInfo, jList);
    }

    resolveContactPoints(collInfo: CollisionInformation) {
        const bodyA = collInfo.bodyA;
        const bodyB = collInfo.bodyB;
        const bodyAPos = new Vec2(collInfo.bodyAPos.x, collInfo.bodyAPos.y);
        const bodyBPos = new Vec2(collInfo.bodyBPos.x, collInfo.bodyBPos.y);
        const normal = collInfo.normal;
        const contactList = [ collInfo.contact1, collInfo.contact2 ];
        const contactCount = collInfo.contactCount;

        const impulseList: Vec2[] = [];
        const raList: Vec2[] = [];
        const rbList: Vec2[] = [];
        let jList: number[] = [];

        const e = Math.min(bodyA.restitution, bodyB.restitution);

        for (let i = 0; i < contactCount; i++) {
            const ra = contactList[i].sub(bodyAPos);
            const rb = contactList[i].sub(bodyBPos);

            raList.push(ra);
            rbList.push(rb);

            const raPerp = new Vec2(-ra.y, ra.x);
            const rbPerp = new Vec2(-rb.y, rb.x);

            const angularVelocityA = raPerp.mul(bodyA.rotationalVelocity);
            const angularVelocityB = rbPerp.mul(bodyB.rotationalVelocity);

            const relativeVelocity = new Vec2(0, 0);
            relativeVelocity.x = (bodyB.linearVelocity.x + angularVelocityB.x) - (bodyA.linearVelocity.x + angularVelocityA.x);
            relativeVelocity.y = (bodyB.linearVelocity.y + angularVelocityB.y) - (bodyA.linearVelocity.y + angularVelocityA.y);

            const magnitude = relativeVelocity.dot(normal);

            if (magnitude > 0) {
                continue;
            }

            const raPerpDotN = raPerp.dot(normal);
            const rbPerpDotN = rbPerp.dot(normal);

            const denom = bodyA.inverseMass + bodyB.inverseMass + 
                (raPerpDotN * raPerpDotN) * bodyA.inverseInertia +
                (rbPerpDotN * rbPerpDotN) * bodyB.inverseInertia;


            let j = (- 1 - e) * magnitude;
            j /= denom;

            jList.push(j);

            const impulse = normal.mul(j);

            impulseList.push(impulse);
        }

        for (let i = 0; i < impulseList.length; i++) {
            bodyA.linearVelocity = bodyA.linearVelocity.add(impulseList[i].mul(-bodyA.inverseMass));
            bodyA.rotationalVelocity += -raList[i].cross(impulseList[i]) * bodyA.inverseInertia; 
            
            bodyB.linearVelocity = bodyB.linearVelocity.add(impulseList[i].mul(bodyB.inverseMass));
            bodyB.rotationalVelocity += rbList[i].cross(impulseList[i]) * bodyB.inverseInertia;
        }

        return jList;
    }

    resolveFriction(collInfo: CollisionInformation, jList: number[]) {
        const bodyA = collInfo.bodyA;
        const bodyB = collInfo.bodyB;
        const bodyAPos = new Vec2(collInfo.bodyAPos.x, collInfo.bodyAPos.y);
        const bodyBPos = new Vec2(collInfo.bodyBPos.x, collInfo.bodyBPos.y);
        const normal = collInfo.normal;
        const contactList = [ collInfo.contact1, collInfo.contact2 ];
        const contactCount = collInfo.contactCount;

        let impulseList: Vec2[] = [];
        let raList: Vec2[] = [];
        let rbList: Vec2[] = [];

        const sf = (bodyA.staticFriction + bodyB.staticFriction) * 0.5;
        const df = (bodyA.dynamicFriction + bodyB.dynamicFriction) * 0.5;

        for (let i = 0; i < contactCount; i++) {
            if (typeof jList[i] == 'undefined') {
                continue;
            }

            const ra = contactList[i].sub(bodyAPos);
            const rb = contactList[i].sub(bodyBPos);

            raList.push(ra);
            rbList.push(rb);

            const raPerp = new Vec2(-ra.y, ra.x);
            const rbPerp = new Vec2(-rb.y, rb.x);

            const angularVelocityA = raPerp.mul(bodyA.rotationalVelocity);
            const angularVelocityB = rbPerp.mul(bodyB.rotationalVelocity);

            const relativeVelocity = new Vec2(0, 0);
            relativeVelocity.x = (bodyB.linearVelocity.x + angularVelocityB.x) - (bodyA.linearVelocity.x + angularVelocityA.x);
            relativeVelocity.y = (bodyB.linearVelocity.y + angularVelocityB.y) - (bodyA.linearVelocity.y + angularVelocityA.y);

            const magnitudeVector = normal.mul(relativeVelocity.dot(normal));
            let tangent = relativeVelocity.sub(magnitudeVector);

            if (tangent.equals(Vec2.ZERO)) {
                continue;
            }

            tangent = tangent.normalize();

            const raPerpDotT = raPerp.dot(tangent);
            const rbPerpDotT = rbPerp.dot(tangent);

            const denom = bodyA.inverseMass + bodyB.inverseMass +
                (raPerpDotT * raPerpDotT) * bodyA.inverseInertia +
                (rbPerpDotT * rbPerpDotT) * bodyB.inverseInertia;


            let jt = -relativeVelocity.dot(tangent);
            jt /= denom;

            let friction: Vec2;

            if (Math.abs(jt) <= jList[i] * sf) {
                friction = tangent.mul(jt);
            }
            else {
                friction = tangent.mul(-jList[i] * df);
            }

            impulseList.push(friction);
        }

        for (let i = 0; i < impulseList.length; i++) {
            bodyA.linearVelocity = bodyA.linearVelocity.add(impulseList[i].mul(-bodyA.inverseMass));
            bodyA.rotationalVelocity += -raList[i].cross(impulseList[i]) * bodyA.inverseInertia; 
            
            bodyB.linearVelocity = bodyB.linearVelocity.add(impulseList[i].mul(bodyB.inverseMass));
            bodyB.rotationalVelocity += rbList[i].cross(impulseList[i]) * bodyB.inverseInertia;
        }
    }
}
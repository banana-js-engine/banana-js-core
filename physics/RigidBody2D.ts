import { TransformComponent } from "../banana.js";
import { Vec3 } from "../math/MV.ts";

class RigidBody2D {
    mass: number;
    velocity: Vec3;

    constructor() {
        this.mass = 1;
        this.velocity = new Vec3(0, 0, 0);
    }

    integrate(dt: number, transformComponent: TransformComponent) {
        transformComponent.translate(this.velocity.x * dt, this.velocity.y * dt, this.velocity.z * dt);
    }

    addForce(force: Vec3) {

    }
}

export default RigidBody2D;
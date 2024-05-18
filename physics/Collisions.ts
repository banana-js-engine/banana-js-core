import { Vec2 } from "../banana.js";

type CollisionInformation = {
    isColliding: boolean;
    normal: Vec2;
    depth: number;
}

export class Collisions {
    
    static checkCircleCollision(centerA: Vec2, radiusA: number, centerB: Vec2, radiusB: number): CollisionInformation {
        const distance = centerA.distanceTo(centerB);
        const radii = radiusA + radiusB;

        let isColliding = false;
        let normal = Vec2.ZERO;
        let depth = 0;

        if (distance >= radii) {
            return { isColliding, normal, depth };
        }

        isColliding = true;
        normal = centerB.sub(centerA).normalize();
        depth = radii - distance;
        
        return { isColliding, normal, depth };
    }
}
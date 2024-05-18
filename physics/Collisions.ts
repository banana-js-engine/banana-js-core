import { Vec2, Vec4 } from "../banana.js";

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

    static checkPolygonCollision(verticesA: Vec4[], verticesB: Vec4[]) {
        const origin = new Vec2(0, 0);
        const terminus = new Vec2(0, 0);

        for (let i = 0; i < verticesA.length; i++) {
            origin.x = verticesA[i].x;
            origin.y = verticesA[i].y;

            terminus.x = verticesA[(i + 1) % verticesA.length].x;
            terminus.y = verticesA[(i + 1) % verticesA.length].y;

            const edge = terminus.sub(origin); 
            const axis = new Vec2(edge.y, -edge.x);

            const projA = Collisions.projectVertices(verticesA, axis);
            const projB = Collisions.projectVertices(verticesB, axis);

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return false;
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            origin.x = verticesB[i].x;
            origin.y = verticesB[i].y;

            terminus.x = verticesB[(i + 1) % verticesB.length].x;
            terminus.y = verticesB[(i + 1) % verticesB.length].y;

            const edge = terminus.sub(origin); 
            const axis = new Vec2(edge.y, -edge.x);

            const projA = Collisions.projectVertices(verticesA, axis);
            const projB = Collisions.projectVertices(verticesB, axis);

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return false;
            }
        }

        return true;
    }

    private static projectVertices(vertices: Vec4[], axis: Vec2) {
        let min = Number.MAX_SAFE_INTEGER;
        let max = Number.MIN_SAFE_INTEGER;

        const currentVertex = new Vec2(0, 0);

        for (let i = 0; i < vertices.length; i++) {
            currentVertex.x = vertices[i].x;
            currentVertex.y = vertices[i].y;

            const proj = currentVertex.dot(axis);

            if (proj < min) {
                min = proj;
            }

            if (proj > max) {
                max = proj;
            }
        } 

        return { min, max };
    }
}
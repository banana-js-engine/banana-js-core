import { Body2D, Utils, Vec2, Vec3, Vec4 } from "../banana.js";
import { AABB } from "./AABB.js";

export type CollisionInformation = {
    
    bodyA: Body2D;
    bodyB: Body2D;
    bodyAPos: Vec3;
    bodyBPos: Vec3;
    isColliding: boolean;
    normal: Vec2;
    depth: number;
    contact1: Vec2;
    contact2: Vec2;
    contactCount: number;
}

export class Collisions {
    
    static checkCircleCollision(centerA: Vec2, radiusA: number, centerB: Vec2, radiusB: number): CollisionInformation {
        const distance = centerA.distanceTo(centerB);
        const radii = radiusA + radiusB;

        let bodyA = null;
        let bodyB = null;
        let bodyAPos = null;
        let bodyBPos = null;
        let isColliding = false;
        let normal = Vec2.ZERO;
        let depth = 0;
        let contact1 = null;
        let contact2 = null;
        let contactCount = 0;

        if (distance >= radii) {
            return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
        }

        isColliding = true;
        normal = centerB.sub(centerA).normalize();
        depth = radii - distance;

        contact1 = centerA.add(normal.mul(radiusA));
        contactCount = 1;
    
        return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
    }

    static checkAABBCollision(a: AABB, b: AABB) {
        if (a.max.x <= b.min.x || b.max.x <= a.min.x 
            || a.max.y <= b.min.y || b.max.y <= a.min.y
        ) {
           return false; 
        }

        return true;
    }

    static checkPolygonCollision(verticesA: Vec4[], verticesB: Vec4[]): CollisionInformation {
        const origin = new Vec2(0, 0);
        const terminus = new Vec2(0, 0);

        let bodyA = null;
        let bodyB = null;
        let bodyAPos = null;
        let bodyBPos = null;
        let isColliding = false;
        let normal = Vec2.ZERO;
        let depth = Number.MAX_SAFE_INTEGER;
        let contact1 = new Vec2(0, 0);
        let contact2 = new Vec2(0, 0);
        let contactCount = 0;

        for (let i = 0; i < verticesA.length; i++) {
            origin.x = verticesA[i].x;
            origin.y = verticesA[i].y;

            terminus.x = verticesA[(i + 1) % verticesA.length].x;
            terminus.y = verticesA[(i + 1) % verticesA.length].y;

            const edge = terminus.sub(origin); 
            const axis = new Vec2(edge.y, -edge.x).normalize();

            const projA = Collisions.projectVertices(verticesA, axis);
            const projB = Collisions.projectVertices(verticesB, axis);

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
            }

            const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);

            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            origin.x = verticesB[i].x;
            origin.y = verticesB[i].y;

            terminus.x = verticesB[(i + 1) % verticesB.length].x;
            terminus.y = verticesB[(i + 1) % verticesB.length].y;

            const edge = terminus.sub(origin); 
            const axis = new Vec2(edge.y, -edge.x).normalize();

            const projA = Collisions.projectVertices(verticesA, axis);
            const projB = Collisions.projectVertices(verticesB, axis);

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
            }

            const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);

            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        isColliding = true;

        const centerA = Collisions.findCenter(verticesA);
        const centerB = Collisions.findCenter(verticesB);

        const direction = centerB.sub(centerA);

        if (direction.dot(normal) < 0) {
            normal = normal.mul(-1);
        }

        
        
        // contact point(s)
        const p = new Vec2(0, 0);
        let minDistanceSquared = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < verticesA.length; i++) {
            p.x = verticesA[i].x;
            p.y = verticesA[i].y;

            for (let j = 0; j < verticesB.length; j++) {
                origin.x = verticesB[j].x;
                origin.y = verticesB[j].y;

                terminus.x = verticesB[(j + 1) % verticesB.length].x;
                terminus.y = verticesB[(j + 1) % verticesB.length].y;

                const contactInfo = Collisions.pointSegmentDistance(p, origin, terminus);

                if (contactInfo.distanceSquared == minDistanceSquared
                && !contact1.equals(contactInfo.contact)) {
                    contact2.x = contactInfo.contact.x;
                    contact2.y = contactInfo.contact.y;

                    contactCount = 2;
                }
                else if (contactInfo.distanceSquared < minDistanceSquared) {
                    minDistanceSquared = contactInfo.distanceSquared;

                    contact1.x = contactInfo.contact.x;
                    contact1.y = contactInfo.contact.y;

                    contactCount = 1;

                }
            } 
        }

        for (let i = 0; i < verticesB.length; i++) {
            p.x = verticesB[i].x;
            p.y = verticesB[i].y;

            for (let j = 0; j < verticesA.length; j++) {
                origin.x = verticesA[j].x;
                origin.y = verticesA[j].y;

                terminus.x = verticesA[(j + 1) % verticesA.length].x;
                terminus.y = verticesA[(j + 1) % verticesA.length].y;

                const contactInfo = Collisions.pointSegmentDistance(p, origin, terminus);

                if (contactInfo.distanceSquared == minDistanceSquared
                && !contact1.equals(contactInfo.contact)) {
                    contact2.x = contactInfo.contact.x;
                    contact2.y = contactInfo.contact.y;

                    contactCount = 2;

                }
                else if (contactInfo.distanceSquared < minDistanceSquared) {
                    minDistanceSquared = contactInfo.distanceSquared;

                    contact1.x = contactInfo.contact.x;
                    contact1.y = contactInfo.contact.y;

                    contactCount = 1; 

                }
            } 
        }

        return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
    }

    static checkCirclePolygonCollision(center: Vec2, radius: number, vertices: Vec4[]): CollisionInformation {
        const origin = new Vec2(0, 0);
        const terminus = new Vec2(0, 0);

        let bodyA = null;
        let bodyB = null;
        let bodyAPos = null;
        let bodyBPos = null;
        let isColliding = false;
        let normal = Vec2.ZERO;
        let depth = Number.MAX_SAFE_INTEGER;
        let contact1 = new Vec2(0, 0);
        let contact2 = null;
        let contactCount = 0;

        for (let i = 0; i < vertices.length; i++) {
            origin.x = vertices[i].x;
            origin.y = vertices[i].y;

            terminus.x = vertices[(i + 1) % vertices.length].x;
            terminus.y = vertices[(i + 1) % vertices.length].y;

            const edge = terminus.sub(origin); 
            let axis = new Vec2(edge.y, -edge.x);
            axis = axis.normalize();

            const projA = Collisions.projectVertices(vertices, axis);
            const projB = Collisions.projectCircle(center, radius, axis);

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
            }

            const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);

            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        const closestPoint = Collisions.findClosestPointOnPolygon(center, vertices);
        let axis = closestPoint.sub(center);
        axis = axis.normalize();

        const projA = Collisions.projectVertices(vertices, axis);
        const projB = Collisions.projectCircle(center, radius, axis);

        if (projA.min >= projB.max || projB.min >= projA.max) {
            return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
        }

        isColliding = true;
        
        const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);

        if (axisDepth < depth) {
            depth = axisDepth;
            normal = axis;
        }

        const polygonCenter = Collisions.findCenter(vertices);

        const direction = polygonCenter.sub(center);

        if (direction.dot(normal) < 0) {
            normal = normal.mul(-1);
        }

        // contact point
        let minDistanceSquared = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < vertices.length; i++) {
            origin.x = vertices[i].x;
            origin.y = vertices[i].y;

            terminus.x = vertices[(i + 1) % vertices.length].x;
            terminus.y = vertices[(i + 1) % vertices.length].y;

            const contactInfo = Collisions.pointSegmentDistance(center, origin, terminus);

            if (contactInfo.distanceSquared < minDistanceSquared) {
                minDistanceSquared = contactInfo.distanceSquared;
                contact1.x = contactInfo.contact.x;
                contact1.y = contactInfo.contact.y;
            }

        }
        contactCount = 1;

        return { bodyA, bodyB, bodyAPos, bodyBPos, isColliding, normal, depth, contact1, contact2, contactCount };
    }

    private static findClosestPointOnPolygon(center: Vec2, vertices: Vec4[]) {
        let minDistance = Number.MAX_SAFE_INTEGER;
        const closestPoint = new Vec2(0, 0);
        
        const point = new Vec2(0, 0);
        for (let i = 0; i < vertices.length; i++) {
            point.x = vertices[i].x;
            point.y = vertices[i].y;

            const distance = center.distanceTo(point);
            
            if (distance < minDistance) {
                minDistance = distance;

                closestPoint.x = point.x;
                closestPoint.y = point.y;
            }
        }

        return closestPoint;
    }

    private static projectCircle(center: Vec2, radius: number, axis: Vec2) {
        const direction = axis.normalize().mul(radius);

        const p1 = center.add(direction);
        const p2 = center.sub(direction);

        let min = p1.dot(axis);
        let max = p2.dot(axis);

        if (min > max) {
            [min, max] = [max, min]
        }

        return { min, max };

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

    private static findCenter(vertices: Vec4[]): Vec2 {
        let totalX = 0;
        let totalY = 0;

        for (const vertex of vertices) {
            totalX += vertex.x;
            totalY += vertex.y;
        }

        return new Vec2(totalX / vertices.length, totalY / vertices.length);
    }

    private static pointSegmentDistance(p: Vec2, a: Vec2, b: Vec2) {
        const ab = b.sub(a);
        const ap = p.sub(a);

        const proj = ap.dot(ab);
        const abLengthSquared = ab.lengthSquared();
        const d = proj / abLengthSquared;

        let contact = new Vec2(0, 0);

        if (d <= 0) {
            contact.x = a.x;
            contact.y = a.y;
        }
        else if (d >= 1) {
            contact.x = b.x;
            contact.y = b.y;
        }
        else {
            contact = a.add(ab.mul(d));
        }

        const distanceSquared = p.distanceToSquared(contact);

        return { distanceSquared, contact };
    }
}
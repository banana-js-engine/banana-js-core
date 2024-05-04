import { Body2DComponent, TransformComponent } from "../banana";

export class PhysicsWorld {

    public static readonly minBodySize: number = 0.01;
    public static readonly maxBodySize: number = 64; 
    
    public static readonly minDensity: number = 0.5;
    public static readonly maxDensity: number = 21.4;

    public static update(body2d: Body2DComponent, transform: TransformComponent) {
        body2d.move(transform);
    }
}
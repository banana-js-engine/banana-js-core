import { Input, KeyCode, Log } from "../banana.js"
import { ScriptableEntity } from "./ScriptableEntity.ts"

export class Movement extends ScriptableEntity {    

    speed: number;

    onCreate() 
    {
        Log.Info('I AM ALIVE');

        this.speed = 10;
    }

    OnUpdate(deltaTime) 
    {
        if (Input.isKeyPressed(KeyCode.A)) 
        {
            this.transform.translate(-this.speed, 0, 0);
        }

        if (Input.isKeyPressed(KeyCode.D)) 
        {
            this.transform.translate(this.speed, 0, 0);
        }

        if (Input.isKeyPressed(KeyCode.W)) 
        {
            this.transform.translate(0, -this.speed, 0);
        }

        if (Input.isKeyPressed(KeyCode.S)) 
        {
            this.transform.translate(0, this.speed, 0);
        }
    }
}
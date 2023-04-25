import { DirectionType } from "../hooks/useDnd";

export class Vec2 {
    public x: number;
    public y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y
    }

    public toDirection(): DirectionType {
        this.normalize()

        return { bottom: this.y > 0, top: this.y < 0, left: this.x < 0, right: this.x > 0 }

    }
    public normalize() {
        const sum = Math.abs(this.x) + Math.abs(this.y)
        this.x = this.x / sum
        this.y = this.y / sum
        return this
    }
}
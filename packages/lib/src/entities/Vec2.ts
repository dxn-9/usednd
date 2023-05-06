import { DirectionType } from '../hooks/useDnd'

export class Vec2 {
    public x: number
    public y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public toDirection(): DirectionType {

        const normalized = this.normalize()

        return {
            bottom: normalized.y > 0,
            top: normalized.y < 0,
            left: normalized.x < 0,
            right: normalized.x > 0,
        }
    }
    public normalize(): Vec2 {
        const sum = Math.abs(this.x) + Math.abs(this.y)
        return new Vec2(this.x / sum, this.y / sum)
    }
}

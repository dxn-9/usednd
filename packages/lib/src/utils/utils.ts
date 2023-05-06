import { DndElementRect, DndContext } from '../context/ContextTypes'
import { Transform } from '../hooks/useDnd'
import { DndElement } from '../entities/DndElement'
import { DndEventOptions, DndPointerEvent } from '../options/DndEvents'
import { Context } from '../context/DndContext'
import { Vec2 } from '../entities/Vec2'

export type CollisionResult = { success: false } | CollisionResultSuccess
export interface CollisionResultSuccess extends Collision {
    pointOfContact: Vec2
    element: DndElement
    active: DndElement
    distance: number
    success: true
}

export interface Collision {
    element: DndElement
    active: DndElement
    distance: number
    pointOfContact: Vec2
}

export function computeIntersectRect(context: DndContext): CollisionResult {
    const active = context.activeElement
    active?.updateRect()

    if (!active) return { success: false }

    let element: DndElement | null = null
    let distance = 0
    // let bestRatio = 0;

    // topleft corner
    const a_l = new Vec2(active.rect.left, active.rect.top)
    // bottomright corner
    const a_r = new Vec2(active.rect.right, active.rect.bottom)

    let pointOfContact = new Vec2(0, 0)

    for (const [, target] of context.elements) {
        if (target.id === active.id || !target.droppable) continue

        const b_l: Vec2 = new Vec2(target.rect.left, target.rect.top)
        const b_r: Vec2 = new Vec2(target.rect.right, target.rect.bottom)

        let areaRatio = 0
        const localPointOfContact = new Vec2(0, 0)

        const bottom = Math.min(a_r.y, b_r.y)
        const top = Math.max(a_l.y, b_l.y)

        const right = Math.min(a_r.x, b_r.x)
        const left = Math.max(a_l.x, b_l.x)

        if (bottom > top && right > left) {
            const height = bottom - top
            const width = right - left

            if (top === b_l.y) {
                localPointOfContact.y = -1
            } else {
                localPointOfContact.y = 1
            }
            if (left === b_l.x) {
                localPointOfContact.x = -1
            } else {
                localPointOfContact.x = 1
            }

            const elementArea = (b_r.x - b_l.x) * (b_r.y - b_l.y)

            const areaInside = height * width
            areaRatio = areaInside / elementArea
            // y plane is inside
        }

        if (areaRatio > distance) {
            // we want in this case the element with the biggest intersection
            const result: Collision = {
                pointOfContact: localPointOfContact,
                active,
                distance: areaRatio,
                element: target,
            }
            const isAllowed = active.collisionFilter ? active.collisionFilter(result) : true

            if (isAllowed) {
                distance = areaRatio
                element = result.element
                pointOfContact = result.pointOfContact
            }
        }
    }
    if (!element) return { success: false }

    return { element, distance, pointOfContact, success: true, active }
}

export function computeClosestCenter() {
    todo('compute closest center')
}

export function computeClosestPoint(ev: DndPointerEvent, context: DndContext): CollisionResult {
    const active = context.activeElement
    active?.updateRect()

    if (!active) return { success: false }

    // max i32 positive
    let distance = -1 >>> 1 // other cool way is ~0 >>> 1
    let element: DndElement | null = null
    const pointOfContact = new Vec2(0, 0)

    for (const [, target] of context.elements) {
        if (target.id === active?.id) continue // do not calculate the active
        if (!target.droppable) continue

        // {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}

        const distanceToCenter = Math.sqrt(
            pow2(ev.pageX - target.rect.center.x) + pow2(ev.pageY - target.rect.center.y)
        )
        const dragAngle = Math.asin(Math.abs(ev.pageY - target.rect.center.y) / distanceToCenter)

        let dist = 0
        let x = 0
        let y = 0
        if (dragAngle === target.rect.angle) {
            dist = Math.sqrt(pow2(target.rect.width) + pow2(target.rect.center.y))
        } else if (dragAngle < target.rect.angle) {
            //get the cos
            x = target.rect.width / 2
            y = x * Math.tan(dragAngle)
            dist = Math.sqrt(pow2(x) + pow2(y))
        } else {
            //get the sin
            y = target.rect.height / 2
            x = y * Math.tan(Math.PI / 2 - dragAngle)
            dist = Math.sqrt(pow2(y) + pow2(x))
        }

        const l_distance = distanceToCenter - dist

        const localPointOfContact = new Vec2(
            target.rect.center.x - (target.rect.center.x + (ev.pageX > target.rect.center.x ? -x : +x)),
            target.rect.center.y - (target.rect.center.y + (ev.pageY > target.rect.center.y ? -y : +y))
        )

        console.log('LOCAL OF', target.id, localPointOfContact)

        if (l_distance < distance) {
            const result: Collision = {
                pointOfContact: localPointOfContact,
                distance: l_distance,
                active,
                element: target,
            }
            const isAllowed = active.collisionFilter ? active.collisionFilter(result) : true

            if (isAllowed) {
                pointOfContact.x = localPointOfContact.x
                pointOfContact.y = localPointOfContact.y

                distance = l_distance
                element = target
            }
        }
    }

    if (element === null) return { success: false }
    return {
        element,
        distance,
        pointOfContact,
        active,
        success: true,
    }
}

/** Compute the 'rect' property in Element */
export function getElementRect(node: HTMLElement): DndElementRect {
    const geometry = node.getBoundingClientRect()
    const center: Vec2 = new Vec2(geometry.left + geometry.width / 2, geometry.top + geometry.height / 2)
    const angle = Math.asin(geometry.height / Math.sqrt(pow2(geometry.width) + pow2(geometry.height)))

    return {
        center,
        height: geometry.height,
        left: geometry.left,
        right: geometry.right,
        bottom: geometry.bottom,
        top: geometry.top,
        width: geometry.width,
        angle,
    }
}

/** Very simple implementation, its mostly just to compare node's bounding boxes */
export function compareObjects(obj1: object | null | undefined, obj2: object | null | undefined): boolean {
    if (obj1 === obj2) return true
    if (!obj2) return false
    if (!obj1) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    type g = keyof typeof obj1
    // typescript :D
    const areEqual = keys1.every((key) => {
        if (typeof obj1[key as g] !== typeof obj2[key as g]) {
            return false
        }
        if (typeof obj1[key as g] === 'object') {
            return compareObjects(obj1[key as g], obj2[key as g])
        }

        return obj1[key as g] === obj2[key as g]
    })

    return areEqual
}

/** Calculate direction */

export function pow2(num: number) {
    return Math.pow(num, 2)
}

export function createEventOptions(ev: DndPointerEvent): DndEventOptions {
    const ctx = Context.getState()
    if (!ctx.activeElement) throw new Error('No active element')
    return {
        context: ctx,
        active: ctx.activeElement,
        over: ctx.overElement,
        event: ev,
        collision: ctx.lastCollision,
    }
    // distinct the target type based on the event  - if draggable event or droppable event
    // return { context: ctx, active: ctx.activeElement, event: ev, over: ctx.overElement, }
}

export function todo(str: string) {
    console.log('TODO:', str)
}

// export function clearOverStack(ev: DndPointerEvent) {
// const ctx = Context.getState()
// const over = ctx.overStack.pop()
// if (over) {
//     over.onDragOverLeave?.(ev)
// }
// }

export function CSSTransform(transform: Transform): string {
    if (!transform.x && !transform.y && !transform.z && transform.scale === 1) return 'unset'
    return `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${transform.scale})`
}

// export function lerpValue(a: number, b: number, time: number, updater: (val: number) => void) {
//     const initialTime = Date.now()

//     const interval = setInterval(() => {
//         console.log('running interval')
//         const currentTime = Date.now()
//         const delta = currentTime - initialTime
//         const progress = Math.min(1, delta / time)
//         const val = a + ((b - a) * progress)
//         if (progress >= 1) {
//             updater(val)
//             clearInterval(interval)
//             return
//         }
//         updater(val)

//     }, 1000 / 60)

// }

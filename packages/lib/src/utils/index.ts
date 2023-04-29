import React from "react";
import { UniqueId, DndElementRect } from "../context/ContextTypes"
import { DirectionType, Transform } from "../hooks/useDnd"
import { DndElement } from "../entities/DndElement";
import { DndEventOptions, DndPointerEvent } from "../options/DndEvents";
import { Context } from "../context/DndContext";
import { Vec2 } from "../entities/Vec2";


export type CollisionResult = { success: false } | CollisionResultSuccess
export interface CollisionResultSuccess extends Collision {
    pointOfContact: Vec2
    element: DndElement
    distance: number
    success: true
}

export interface Collision {
    element: DndElement;
    distance: number;
    pointOfContact: Vec2
}


export function computeIntersectRect(): CollisionResult {
    const context = Context.getState()
    const active = context.activeElement;
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

        let areaRatio = 0;
        const localPointOfContact = new Vec2(0, 0)

        const bottom = Math.min(a_r.y, b_r.y)
        const top = Math.max(a_l.y, b_l.y)

        const right = Math.min(a_r.x, b_r.x)
        const left = Math.max(a_l.x, b_l.x)


        if (bottom > top && right > left) {
            const height = bottom - top;
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

        const result: Collision = { pointOfContact: localPointOfContact, distance: areaRatio, element: target }
        const isAllowed = active.collisionFilter ? active.collisionFilter(result) : true

        if (isAllowed && areaRatio > distance) {
            // we want in this case the element with the biggest intersection
            distance = areaRatio
            element = result.element
            pointOfContact = result.pointOfContact
        }


    }
    if (!element) return { success: false }

    return { element, distance, pointOfContact, success: true }

}


export function normalizeVecToDirectionType(vec: Vec2): DirectionType {


}


export function computeClosestCenter() {
    todo("compute closest center")
}

export function computeClosestDroppable(ev: DndPointerEvent, allElements: Map<UniqueId, DndElement>, active: DndElement): CollisionResult {
    // max 32bit uint 
    let closestDistance = -1 >>> 1 // other cool way is ~0 >>> 1
    let closestElement: DndElement | null = null;
    const pointOfContact = new Vec2(0, 0)


    for (const [, element] of allElements) {
        if (element.id === active?.id) continue // do not calculate the active 
        if (!element.droppable) continue

        // {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}



        const distanceToCenter = Math.sqrt(pow2(ev.pageX - element.rect.center.x) + pow2(ev.pageY - element.rect.center.y))
        const dragAngle = Math.asin((Math.abs(ev.pageY - element.rect.center.y) / distanceToCenter))

        let dist = 0
        let x = 0;
        let y = 0
        if (dragAngle === element.rect.angle) {
            dist = Math.sqrt(pow2(element.rect.width) + pow2(element.rect.center.y))
        } else if (dragAngle < element.rect.angle) {
            //get the cos
            x = element.rect.width / 2
            y = x * Math.tan(dragAngle)
            dist = Math.sqrt(pow2(x) + pow2(y))
        } else {
            //get the sin
            y = element.rect.height / 2
            x = y * Math.tan(Math.PI / 2 - dragAngle)
            dist = Math.sqrt(pow2(y) + pow2(x))

        }

        const distance = distanceToCenter - dist;

        if (distance < closestDistance) {
            pointOfContact.x = element.rect.center.x - (element.rect.center.x + (ev.pageX > element.rect.center.x ? -x : +x))
            pointOfContact.y = element.rect.center.y - (element.rect.center.y + (ev.pageY > element.rect.center.y ? -y : +y))
            closestDistance = distance;
            closestElement = element
        }

    }

    if (closestElement === null) return { success: false }
    return {
        element: closestElement,
        distance: closestDistance,
        pointOfContact,
        success: true

    }

}


/** Compute the 'rect' property in Element */
export function getElementRect(node: HTMLElement): DndElementRect {

    const geometry = node.getBoundingClientRect()
    const center: Vec2 = { x: geometry.left + geometry.width / 2, y: geometry.top + geometry.height / 2 }
    const angle = Math.asin(geometry.height / Math.sqrt(pow2(geometry.width) + pow2(geometry.height)))


    return {
        center,
        height: geometry.height,
        left: geometry.left,
        right: geometry.right,
        bottom: geometry.bottom,
        top: geometry.top,
        width: geometry.width,
        angle
    }
}

export function createContextSnapshot(ev: DndPointerEvent): DndEventOptions {
    const context = Context.getState()



    // return {}
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
export function computeDirection(element: DndElement, position: Vec2): DirectionType {


    const distanceToCenter = Math.sqrt(pow2(position.x - element.rect.center.x) + pow2(position.x - element.rect.center.y))
    const dragAngle = Math.asin((Math.abs(position.x - element.rect.center.y) / distanceToCenter))

    const x = position.x - element.rect.center.x
    const y = position.y - element.rect.center.y
    const vector = normalize([x, y])

    console.log('vector', vector)
    return {
        vector,
        up: y <= 0 && dragAngle >= element.rect.angle,
        down: y > 0 && dragAngle >= element.rect.angle,
        left: x <= 0 && dragAngle < element.rect.angle,
        right: x > 0 && dragAngle < element.rect.angle
    }


}





export function pow2(num: number) {
    return Math.pow(num, 2)
}

export function normalize(vec: [number, number]): Vec2 {
    const sum = Math.abs(vec[0]) + Math.abs(vec[1])
    return { x: vec[0] / sum, y: vec[1] / sum }
}


export function createEventOptions(ev: DndPointerEvent): DndEventOptions {
    const ctx = Context.getState()
    if (!ctx.activeElement) throw new Error('No active element')
    todo('createEventOptions')
    // distinct the target type based on the event  - if draggable event or droppable event
    // return { context: ctx, active: ctx.activeElement, event: ev, over: ctx.overElement, }
}


export function todo(str: string) {
    console.log('TODO:', str)
}

export function clearOverStack(ev: DndPointerEvent) {
    const ctx = Context.getState()
    const over = ctx.overStack.pop()
    if (over) {
        over.onDragOverLeave?.(ev)
    }
}


export function CSSTransform(transform: Transform): string {
    if (!transform.x && !transform.y && !transform.z && transform.scale === 1) return 'unset'
    return `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${transform.scale})`
}

export function lerpValue(a: number, b: number, time: number, updater: (val: number) => void) {
    const initialTime = Date.now()

    const interval = setInterval(() => {
        console.log('running interval')
        const currentTime = Date.now()
        const delta = currentTime - initialTime
        const progress = Math.min(1, delta / time)
        const val = a + ((b - a) * progress)
        if (progress >= 1) {
            updater(val)
            clearInterval(interval)
            return
        }
        updater(val)

    }, 1000 / 60)


}
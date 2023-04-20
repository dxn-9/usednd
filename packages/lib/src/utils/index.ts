import React from "react";
import { UniqueId, DndElement, DndElementRect, Vec2 } from "../context/ContextTypes"
import { DirectionType } from "../hooks/useDnd"



export function computeClosestDroppable(ev: React.PointerEvent, allElements: Map<UniqueId, DndElement>, active?: DndElement) {
    // max 32bit uint 
    let closestDistance = -1 >>> 1 // other cool way is ~0 >>> 1
    let closestElement: DndElement | null = null;
    const pointOfContact = { x: 0, y: 0 }


    for (const [id, element] of allElements) {
        if (element.id === active?.id) continue // do not calculate the active 
        if (!element.droppable) continue

        // {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}



        const distanceToCenter = Math.sqrt(pow2(ev.pageX - element.rect.center.x) + pow2(ev.pageY - element.rect.center.y))
        const dragAngle = Math.asin((Math.abs(ev.pageY - element.rect.center.x) / distanceToCenter))

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
            console.log('xy', x, y, element.id)
            pointOfContact.x = element.rect.center.x + (ev.pageX > element.rect.center.x ? x : -x)
            pointOfContact.y = element.rect.center.y + (ev.pageY > element.rect.center.y ? y : -y)
            closestDistance = distance;
            closestElement = element
        }

    }



    return {
        closestDistance, closestElement, pointOfContact
    }

}


/** Compute the 'rect' property in Element */
export function getElementRect(node: HTMLElement): DndElementRect {

    const geometry = node.getBoundingClientRect()
    const center: Vec2 = { x: geometry.left + geometry.width / 2, y: geometry.top + geometry.height / 2 }
    const angle = Math.asin(geometry.height / Math.sqrt(pow2(geometry.width) + pow2(geometry.height)))


    return { center, height: geometry.height, left: geometry.left, top: geometry.top, width: geometry.width, angle }
}




/** Very simple implementation, its mostly just to compare node's bounding boxes */
export function compareObjects(obj1: object, obj2: object): boolean {

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
    return [vec[0] / sum, vec[1] / sum]
}

export function todo(str: string) {
    console.log('TODO:', str)
}


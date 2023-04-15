import { UniqueId, Element, ElementRect } from "../Context/DndContext"

export function computeClosestDroppable(ev: PointerEvent, allElements: Map<UniqueId, Element>, active?: Element) {
    // max 32bit uint 
    let closestDistance = -1 >>> 1 // other cool way is ~0 >>> 1
    let closestElement: Element | null = null

    let line = { x1: ev.pageX, y1: ev.pageY, x2: 0, y2: 0 }

    for (const [id, element] of allElements) {
        if (element.id === active?.id) continue // do not calculate the active 
        if (!element.droppable) continue

        // {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}



        const distanceToCenter = Math.sqrt(pow2(ev.pageX - element.rect.center[0]) + pow2(ev.pageY - element.rect.center[1]))
        const dragAngle = Math.asin((Math.abs(ev.pageY - element.rect.center[1]) / distanceToCenter))

        let dist = 0
        let x2 = 0;
        let y2 = 0
        if (dragAngle === element.rect.angle) {
            dist = Math.sqrt(pow2(element.rect.width) + pow2(element.rect.center[1]))
        } else if (dragAngle < element.rect.angle) {
            //get the cos
            x2 = element.rect.width / 2
            y2 = x2 * Math.tan(dragAngle)
            dist = Math.sqrt(pow2(x2) + pow2(y2))
        } else {
            //get the sin
            y2 = element.rect.height / 2
            x2 = y2 * Math.tan(Math.PI / 2 - dragAngle)
            dist = Math.sqrt(pow2(y2) + pow2(x2))

        }

        const distance = distanceToCenter - dist;

        if (distance < closestDistance) {
            line.x2 = element.rect.center[0] + (ev.pageX > element.rect.center[0] ? x2 : -x2)
            line.y2 = element.rect.center[1] + (ev.pageY > element.rect.center[1] ? y2 : - y2)
            closestDistance = distance;
            closestElement = element
        }

    }



    return { closestDistance, closestElement, line }

}


/** Compute the 'rect' property in Element */

export function getElementRect(node: HTMLElement): ElementRect {

    const geometry = node.getBoundingClientRect()
    const center: [number, number] = [geometry.left + geometry.width / 2, geometry.top + geometry.height / 2]
    const angle = Math.asin(geometry.height / Math.sqrt(pow2(geometry.width) + pow2(geometry.height)))


    return { center, height: geometry.height, left: geometry.left, top: geometry.top, width: geometry.width, angle }
}




/** Very simple implementation, its mostly just to compare node's bounding boxes */

export function compareObjects(obj1: Object, obj2: Object): boolean {

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

export function pow2(num: number) {
    return Math.pow(num, 2)
}
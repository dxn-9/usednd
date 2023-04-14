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


        /** doing a little bit of trigonometry  */

        const distanceToCenter = Math.sqrt(Math.pow(ev.pageX - element.rect.center[0], 2) + Math.pow(ev.pageY - element.rect.center[1], 2))


        const angleSin = (Math.abs(ev.pageY - element.rect.center[1])) / distanceToCenter
        const angleCos = (Math.abs(ev.pageX - element.rect.center[0])) / distanceToCenter

        const length = (element.rect.height / 2) * ((element.rect.width / 2) / (element.rect.height / 2))
        const internalDist = length
        const distance = distanceToCenter - internalDist;

        if (distance < closestDistance) {
            line.x2 = element.rect.center[0] + (ev.pageX > element.rect.center[0] ? angleCos * length : - angleCos * length)
            line.y2 = element.rect.center[1] + (ev.pageY > element.rect.center[1] ? angleSin * length : - angleSin * length)
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

    return { center, height: geometry.height, left: geometry.left, top: geometry.top, width: geometry.width }
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
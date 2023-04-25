import { describe, expect, assert, it } from 'vitest'
import { computeClosestDroppable, getElementRect, pow2 } from '../src/utils/index'
import { Element } from '../src/Context/DndContext'


it('should caculate the correct rect', () => {

    const node = { getBoundingClientRect: () => ({ top: 10, left: 10, width: 20, height: 20 }) } as HTMLElement
    const rect = getElementRect(node)

    expect(rect.angle).toBeCloseTo(Math.PI / 4)
    expect(rect.center).toEqual([20, 20])
    expect(rect).toHaveProperty("top", 10)
    expect(rect).toHaveProperty("left", 10)
    expect(rect).toHaveProperty("width", 20)
    expect(rect).toHaveProperty("height", 20)
})


it('should compute closest droppable', () => {
    const mockEvent = { pageX: 0, pageY: 0 } as PointerEvent
    const mockElements = new Map()
    const rect1 = getElementRect({ getBoundingClientRect: () => ({ top: 100, left: 100, width: 40, height: 20 }) } as HTMLElement)
    const rect2 = getElementRect({ getBoundingClientRect: () => ({ top: 50, left: 10, width: 100, height: 10 }) } as HTMLElement)
    // ^ center: [60,55] , angle: 0,09966865249116202737844611987796
    mockElements.set(1, { id: 1, rect: rect1, droppable: true })
    mockElements.set(2, { id: 2, rect: rect2, droppable: true })

    const result = computeClosestDroppable(mockEvent, mockElements)
    // ^ distanceToCenter: 81,3941.. , dragAngle: 0,7419472680059174, ^y: 5 x: ~5,454545 => dist ~7,399463 -- totalDist = ~73,994637


    expect(result.success).toBeTruthy()
    if (result.success) {
        expect(result.distance).toBeCloseTo(73.994637)
        expect(result.pointOfContact.x).toBeCloseTo(rect2.center[0] - 5.454545)
        expect(result.pointOfContact.y).toBeCloseTo(rect2.center[1] - 5)
    }
    // we expect the values to be subtracted because the drag point is from above
})

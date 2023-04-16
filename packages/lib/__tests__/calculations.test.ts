import { describe, expect, assert, it } from 'vitest'
import { computeClosestDroppable, getElementRect, pow2 } from '../src/utils/index'
import { Element } from '../src/Context/DndContext'


it('should caculate the correct rect', () => {

    const node = { getBoundingClientRect: () => ({ top: 10, left: 10, width: 20, height: 20 }) } as any

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
    mockElements.set(1, { id: 1, rect: { top: 100, width: 20, height: 20, left: 100, center: [110, 110], angle: 0 } })


    const result = computeClosestDroppable(mockEvent, mockElements)


})

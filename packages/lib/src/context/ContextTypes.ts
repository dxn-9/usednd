import { DndProviderProps } from './DndContext'
import { DndElement, DndElementOptions } from '../entities/DndElement'
import { Vec2 } from '../entities/Vec2'
import { Defined } from '../utils/types'
import { DndCollision } from '../options/DndCollisions'
import { CollisionResultSuccess } from '../utils/utils'

export type UniqueId = string | number

export interface DndEvent extends PointerEvent {
    dnd: {
        active: Element
        over: Element
        pointOfContact: [number, number]
    }
}

export interface DndElementRect {
    angle: number
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
    center: Vec2
}

// export interface Vec2 {
//     x: number
//     y: number
// }

export type DndContext = DndContextInt &
    ({ isDragging: true; activeElement: DndElement } | { isDragging: false; activeElement: null })

export interface DndContextInt {
    // isDragging: boolean
    isOutside: boolean
    dndProviderProps: Defined<DndProviderProps, "outsideThreshold">
    elements: Map<UniqueId, DndElement>
    ghostNode: DndElement | null
    // cleanupFunctions: (() => void)[]
    // activeElement: DndElement | null
    overElement: DndElement | null
    lastCollision: CollisionResultSuccess | null

    register: (id: UniqueId, node: HTMLElement, options: DndElementOptions) => DndElement
    unregister: (id: UniqueId) => void
}

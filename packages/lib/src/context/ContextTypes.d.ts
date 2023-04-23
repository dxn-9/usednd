import { DndProviderProps } from "./DndContext"
import { DndElement } from "../entities/DndElement"

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

export interface DndElementCallbacks {

    onOutsideOver?: (ev: DndEvent) => void
    /** TODO: */
    onOutsideOverLeave?: (ev: any) => any
}
export interface Vec2 {
    x: number
    y: number
}

export type DndContext = DndContextInt & ({ isDragging: true; activeElement: DndElement } | { isDragging: false; activeElement: null })




export interface DndContextInt {
    // isDragging: boolean
    isOutside: boolean
    dndProviderProps: DndProviderProps
    elements: Map<UniqueId, DndElement>
    ghostNode: DndElement | null
    cleanupFunctions: (() => void)[]
    // activeElement: DndElement | null
    overElement: DndElement | null
    overStack: DndElement[]

    register: (id: UniqueId, node: HTMLElement, options: { draggable: boolean, droppable: boolean, data?: any, callbacks?: DndElementCallbacks }) => DndElement
    unregister: (id: UniqueId) => void
}

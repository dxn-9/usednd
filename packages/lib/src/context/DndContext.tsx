import React, {
    PropsWithChildren,
    createContext,
    useEffect,
    useMemo,
} from 'react'
import { DndContext } from './ContextTypes'
import { DndElement } from '../entities/DndElement'
import { DndEvents } from '../options/DndEvents'
import { DndCollision } from '../options/DndCollisions'
import { pointerMove, pointerUp } from './DragEvents'

interface DndGlobContext extends React.Context<DndContext> {
    getState: () => DndContext
}

export const Context = createContext<DndContext>({
    dndProviderProps: {},
} as DndContext) as DndGlobContext

export interface DndProviderProps extends Partial<DndEvents> {
    // onDrop?: (ev: PointerEvent, active: DndElement, over: DndElement, context: DndContext) => any
    ghost?: () => JSX.Element
    /** Distance for mouse in pixels to element to trigger the over effect in case of DndCollision.ClosestPoint / DndCollision.ClosestRect method
     *	Default value: 100
     */
    outsideThreshold?: number
    collisionDetection?: DndCollision
}

export const DndProvider: React.FC<PropsWithChildren<DndProviderProps>> = ({
    collisionDetection = DndCollision.RectIntersect,
    outsideThreshold = 100,
    children,
    ghost,
    ...callbacks
}) => {
    // current problem: if props change the context is not updated or recreated
    const context = useMemo<DndContext>(
        () => ({
            elements: new Map(),
            // cleanupFunctions: [],
            isDragging: false,
            isOutside: false,
            dndProviderProps: {
                collisionDetection,
                outsideThreshold,
                ghost,
                ...callbacks,
            },
            lastCollision: null,
            ghostNode: null,
            overElement: null,
            activeElement: null,
            register: (id, node, options) => {
                const element: DndElement = new DndElement(id, node, options)
                context.elements?.set(id, element)
                return element
            },
            unregister: (id) => {
                context.elements?.delete(id)
                // context.cleanupFunctions.push(() => context.elements.delete(id))
            },
        }),
        []
    )

    useEffect(() => {
        window.addEventListener('pointermove', pointerMove)
        window.addEventListener('pointerup', pointerUp)
        return () => {
            window.removeEventListener('pointermove', pointerMove)
            window.removeEventListener('pointerup', pointerUp)
        }
    }, [])

    useEffect(() => {
        Context.getState = () => context
    }, [context])

    /** Debug */
    useEffect(() => {
        const showState = (ev: KeyboardEvent) => {
            if (ev.key === 'X') console.log(context)
        }
        window.addEventListener('keydown', showState)
        return () => {
            window.removeEventListener('keydown', showState)
        }
    }, [])

    return (
        <Context.Provider value={context}>
            {children}
        </Context.Provider>
    )
}
export default DndProvider

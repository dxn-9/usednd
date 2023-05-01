import React, {
    PropsWithChildren,
    createContext,
    startTransition,
    useEffect,
    useMemo,
} from 'react'
import {
    CollisionResult,
    computeClosestPoint,
    computeIntersectRect,
    createEventOptions,
} from '../utils/utils'
import { DndContext } from './ContextTypes'
import { DndElement } from '../entities/DndElement'
import { DndEvents } from '../options/DndEvents'
import { DndCollision } from '../options/DndCollisions'

interface DndGlobContext extends React.Context<DndContext> {
    getState: () => DndContext
}

export const Context = createContext<DndContext>({
    dndProviderProps: {},
} as DndContext) as DndGlobContext

export interface DndProviderProps extends Partial<DndEvents> {
    // onDrop?: (ev: PointerEvent, active: DndElement, over: DndElement, context: DndContext) => any
    debug?: boolean
    ghost?: () => JSX.Element
    /** Distance for mouse in pixels to element to trigger the over effect
     *	Default value: 100
     */
    outsideThreshold?: number
    /**
     *
     */
    collisionDetection?: DndCollision
}

export const DndProvider: React.FC<PropsWithChildren<DndProviderProps>> = ({
    collisionDetection = DndCollision.RectIntersect,
    outsideThreshold = 100,
    children,
    debug,
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
                debug,
                ghost,
                callbacks,
            },
            ghostNode: null,
            overElement: null,
            activeElement: null,
            register: (id, node, options) => {
                const element: DndElement = new DndElement(id, node, options)
                context.elements?.set(id, element)
                node.style.userSelect = 'none'
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
        function pointerUp(ev: PointerEvent) {
            if (!context.isDragging) return

            startTransition(() => {
                // react stateful updates
                if (context.activeElement && context.overElement && context.overElement.lastCollision) {
                    context.overElement.onDrop?.(ev, context.overElement.lastCollision)
                    callbacks?.onDrop?.(createEventOptions(ev, context.overElement.lastCollision))
                }

                callbacks.onDragEnd?.(createEventOptions(ev))
                context.activeElement?.onDragEnd(ev)
            })

            context.overElement?.onDragOverLeave?.(ev)

                /** Cleanup */
                ; (context.isDragging as boolean) = false
            context.activeElement.movementDelta.x = 0
            context.activeElement.movementDelta.y = 0
            context.activeElement.isActive = false
                ; (context.isDragging as boolean) = false
                ; (context.activeElement as DndElement | null) = null
        }
        function pointerMove(ev: PointerEvent) {
            if (!context.isDragging) return
            ev.preventDefault()
            // console.log('is dragging', context.activeElement)
            // if its dragging and its not inside a droppable element
            let collision: CollisionResult | null = null

            if (collisionDetection === DndCollision.ClosestPoint) {
                collision = computeClosestPoint(ev, context)
                if (!collision.success || collision.distance > outsideThreshold) {
                    context.overElement = null
                } else {
                    if (debug) {
                        /** Update debug line if debug - just do it imperatively so it doesnt affect react performance */
                        const line = document.querySelector('#dnd-debug-view') as SVGLineElement
                        line.setAttribute('x1', ev.pageX.toString())
                        line.setAttribute('x2', (collision.element.rect.center.x + collision.pointOfContact?.x).toString())
                        line.setAttribute('y1', ev.pageY.toString())
                        line.setAttribute('y2', (collision.element.rect.center.y + collision.pointOfContact.y).toString())
                    }

                    if (collision.element.isOver) {
                        /** if its still over the same element, just fire the move */
                        collision.element.onDragOverMove(ev, collision)
                    } else {
                        collision.element?.onDragOverStart(ev, collision)
                    }
                }
            }

            if (collisionDetection === DndCollision.RectIntersect) {
                collision = computeIntersectRect(context)

                if (!collision.success) {
                    context.overElement = null
                } else {
                    // console.log('RESULT', collision)
                    if (collision.element.isOver) {
                        collision.element.onDragOverMove(ev, collision)
                    } else {
                        collision.element.onDragOverStart(ev, collision)
                    }
                }
            }
            context.activeElement.onDragMove(ev)
        }

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
            {debug && (
                <svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
                    <line x1={0} y1={0} x2={0} y2={0} stroke="red" id="dnd-debug-view"></line>
                </svg>
            )}
            {children}
        </Context.Provider>
    )
}
export default DndProvider

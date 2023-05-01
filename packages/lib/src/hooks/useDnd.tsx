import React, { startTransition, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Context } from '../context/DndContext'
import { UniqueId } from '../context/ContextTypes'
import { compareObjects, getElementRect } from '../utils/utils'
import { onPointerDown } from '../context/DragEvents'
import { DndElementEvents } from '../options/DndEvents'
import { DndElement, DndElementOptions } from '../entities/DndElement'

export interface DirectionType {
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
}

type OverType =
    | {
        isOver: true
        direction: DirectionType
    }
    | {
        isOver: false
        direction: null
    }

function getSyntethicListeners(id: UniqueId, options: DndElementOptions) {
    // console.log('id ', id)
    const events = {} as Record<string, (ev: React.PointerEvent) => void>
    if (options.draggable) {
        events.onPointerDown = (ev: React.PointerEvent) => onPointerDown(ev, id)
    }

    return events
}

export interface DndElementState {
    // transform: { x: number, y: number }
    over?: boolean
    active?: boolean
    // direction?: DirectionType
}
export interface Transform {
    x: number
    y: number
    z: number
    scale: number
}

export const useDnd = (
    id: UniqueId,
    { draggable, droppable, data, callbacks, collisionFilter }: DndElementOptions = { draggable: true, droppable: true }
) => {
    const context = useContext(Context)
    const elemRef = useRef<DndElement | null>(null)
    const nodeRef = useRef<HTMLElement | null>(null)
    const listeners = getSyntethicListeners(id, { draggable, droppable })
    // const [state, setState] = useState<DndElementState>({})
    const [transform, setTransform] = useState<Transform>({
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
    })
    const [over, setOver] = useState<OverType>({
        isOver: false,
        direction: null,
    }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
    const [active, setActive] = useState(false)

    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy
    }

    const cbs: Partial<DndElementEvents> = useMemo(
        () => ({
            onDragStart: (o) => {
                if (nodeRef.current) nodeRef.current.style.zIndex = '9999'

                startTransition(() => {
                    setActive(true)
                    setTransform(() => ({ x: 0, y: 0, z: 0, scale: 1 }))
                })
                callbacks?.onDragStart?.(o)
            },
            onDragEnd: (o) => {
                if (nodeRef.current) nodeRef.current.style.zIndex = ""
                startTransition(() => {
                    setActive(false)
                    setTransform({ x: 0, y: 0, z: 0, scale: 1 })
                })

                callbacks?.onDragEnd?.(o)
            },
            onDragMove: (o) => {
                setTransform((prev) => ({
                    x: o.active.movementDelta.x,
                    y: o.active.movementDelta.y,
                    z: 999,
                    scale: prev.scale,
                }))
            },
            onDragOverLeave: () => {
                setOver({ isOver: false, direction: null })
            },
            onDragOverMove: (o) => {
                const direction = o.collision.pointOfContact.toDirection()
                const sameDir = compareObjects(direction, over.direction)
                if (!sameDir) {
                    setOver({ isOver: true, direction })
                }
            },
            onDragOverStart: (o) => {
                if (o.collision.pointOfContact) {
                    const direction = o.collision.pointOfContact.toDirection()
                    setOver({ isOver: true, direction })
                }
            },
        }),
        [callbacks]
    )

    useEffect(() => {
        if (nodeRef.current) {
            const elem = context.register(id, nodeRef.current, {
                data,
                draggable,
                droppable,
                callbacks: cbs,
                collisionFilter,
            })

            elemRef.current = elem
        } else {
            console.error('DND: Register an element with setNode!')
        }
        return () => {
            context.unregister(id)
        }
    }, [])

    useEffect(() => {
        /** check on every render if the position has changed, if so update the context , and do not update the rect if active,
         * since we just use pointer position */
        if (elemRef.current && !elemRef.current.isActive) {
            if (!compareObjects(elemRef.current.rect, getElementRect(elemRef.current.node))) {
                // recompute the element box
                elemRef.current?.updateRect()
            }
        }
        if (elemRef.current && data !== elemRef.current.data) {
            elemRef.current.data = data
        }
    })

    return { setNode, listeners, over, active, transform }
}

import React, { createElement, startTransition, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Context } from '../context/DndContext'
import { DndContext, UniqueId, Vec2, } from '../context/ContextTypes'
import { compareObjects, computeDirection, getElementRect, lerpValue, normalize, todo } from '../utils'
import { computeClosestDroppable } from '../utils'
import { createPortal } from 'react-dom'
import { onPointerDown, } from '../context/DragEvents'
import { DndElementEvents } from '../options/DndEvents'
import { DndElement } from '../entities/DndElement'
import { onPointerEnter, onPointerLeave, onPointerMove } from '../context/DropEvents'
import { useSpring, useSpringValue } from '@react-spring/web'


interface DndOptions {
    draggable: boolean
    droppable: boolean
    data?: any
    callbacks?: Partial<DndElementEvents>
}





export interface DirectionType {
    // vector: Vec2;
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
}



type OverType = {
    isOver: true;
    direction: DirectionType
} | {
    isOver: false;
    direction: null
}



function getSyntethicListeners(id: UniqueId, options: DndOptions) {
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

export const useDnd = (id: UniqueId, { draggable, droppable, data, callbacks }: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const elemRef = useRef<DndElement | null>(null)
    const nodeRef = useRef<HTMLElement | null>(null)
    const listeners = getSyntethicListeners(id, { draggable, droppable })
    const [state, setState] = useState<DndElementState>({})
    const [transform, setTransform] = useState<Transform>(context.elements.get(id)?.transform ?? { x: 0, y: 0, z: 0, scale: 1 })





    const [over, setOver] = useState<OverType>({ isOver: false, direction: null }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
    const [active, setActive] = useState(false)
    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }
    // console.log('TRANSFORM', id, transform)

    const cbs: Partial<DndElementEvents> = useMemo(() => ({
        onDragStart: (o) => {
            nodeRef.current!.style.zIndex = '9999'

            startTransition(() => {
                setState((prev) => ({ ...prev, active: true }))
                setTransform(() => ({ x: 0, y: 0, z: 0, scale: 1 }))
            })
            callbacks?.onDragStart?.(o)
        },
        onDragEnd: ((o) => {

            nodeRef.current!.style.zIndex = '0'
            startTransition(() => {
                setState((prev) => ({ ...prev, active: false }))
                setTransform({ x: 0, y: 0, z: 0, scale: 1 })


            })

            callbacks?.onDragEnd?.(o)
        }),
        onDragMove: ((o) => {
            // console.log('ON DRAG MOVE DELTA', o.active.movementDelta)
            setTransform((prev) => ({ x: o.active.movementDelta.x, y: o.active.movementDelta.y, z: 999, scale: prev.scale }))
        }),
        onDragOverEnd: ((o) => {

            setOver({ isOver: false, direction: null })
            // setState((prev) => ({ ...prev, over: false }))
        }),
        onDragOverMove: ((o) => {
            if (o.collision.pointOfContact) {
                const direction = o.collision.pointOfContact.normalize().toDirection()

                const sameDir = compareObjects(direction, over.direction)
                if (!sameDir) {

                    setOver({ isOver: true, direction })

                }
            }
        }),
        onDragOverStart: ((o) => {
            console.log('ON COLLISION START', o, id)

            if (o.collision.pointOfContact) {

                const direction = o.collision.pointOfContact.normalize().toDirection()
                console.log('setting for', id, direction)
                setOver({ isOver: true, direction })
            }
            // setState((prev) => ({ ...prev, over: true }))
        }),



        // ...callbacks
        // onDragMove: (o) => {
        //     setState((prev) => ({ ...prev, active: true, transform: o.active.movementDelta }))
        // },
        // onDragEnd: (o) => {
        //     setState((prev) => ({ ...prev, active: false, transform: { x: 0, y: 0 } }))
        // }
    }), [callbacks])

    // console.log('over state', over, id)




    useEffect(() => {
        if (nodeRef.current) {
            const elem = context.register(id, nodeRef.current, {
                data,
                draggable,
                droppable,
                callbacks: cbs
            });

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
                // console.log('recalculating')
                // contextElem.rect = getElementRect(nodeRef.current)
                // console.log('updating rect')
                elemRef.current?.updateRect()
            }

        }
        if (elemRef.current && data !== elemRef.current.data) {
            elemRef.current.data = data
        }

    })

    useEffect(() => {
        // we queue the cleanup functions to be executed after the react state has been updated so that no referecens are lost
        // console.log(context.cleanupFunctions)
        while (context.cleanupFunctions.length > 0) {
            // console.log(' running cleanup')
            const fn = context.cleanupFunctions.pop()
            fn?.()
        }
    })

    return { setNode, listeners, over, state, transform }

}


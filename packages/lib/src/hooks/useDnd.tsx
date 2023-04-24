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
    up: boolean;
    down: boolean;
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
    scale: number
}

export const useDnd = (id: UniqueId, { draggable, droppable, data, callbacks }: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const elemRef = useRef<DndElement | null>(null)
    const nodeRef = useRef<HTMLElement | null>(null)
    const listeners = getSyntethicListeners(id, { draggable, droppable })
    const [state, setState] = useState<DndElementState>({})
    const [transform, setTransform] = useState<Transform>(context.elements.get(id)?.transform ?? { x: 0, y: 0, scale: 1 })





    const [over, setOver] = useState<OverType>({ isOver: false, direction: null }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
    const [active, setActive] = useState(false)
    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }
    console.log('TRANSFORM', id, transform)

    const cbs: Partial<DndElementEvents> = useMemo(() => ({
        onDragStart: (o) => {
            o.active.node.style.zIndex = '1000'
            startTransition(() => {
                setState((prev) => ({ ...prev, active: true }))
                setTransform(() => ({ x: 0, y: 0, scale: 1 }))
                lerpValue(1, 1.2, 100, (v) => {
                    console.log('lerped value', v)
                    setTransform((prev) => ({ x: prev.x, y: prev.y, scale: v }))
                })
                // setTransform({ x: 0, y: 0, scale: 1.2 })
            })
        },
        onDragEnd: ((o) => {
            o.active.node.style.zIndex = '0'

            startTransition(() => {
                setState((prev) => ({ ...prev, active: false }))
                setTransform({ x: 0, y: 0, scale: 1 })


            })
        }),
        onDragMove: ((o) => {
            setTransform((prev) => ({ x: o.active.movementDelta.x, y: o.active.movementDelta.y, scale: prev.scale }))
            // o.active.node.style.transform = `translate(${o.active.movementDelta.x}px, ${o.active.movementDelta.y}px)`
        }),
        onDragOverEnd: ((o) => {
            console.log('drag over end')
            setState((prev) => ({ ...prev, over: false }))
        }),
        onDragOverStart: ((o) => {
            console.log('drag over end')
            setState((prev) => ({ ...prev, over: true }))
        }),



        ...callbacks
        // onDragMove: (o) => {
        //     setState((prev) => ({ ...prev, active: true, transform: o.active.movementDelta }))
        // },
        // onDragEnd: (o) => {
        //     setState((prev) => ({ ...prev, active: false, transform: { x: 0, y: 0 } }))
        // }
    }), [callbacks])





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
                console.log('updating rect')
                elemRef.current?.updateRect()
            }

        }

    })

    useEffect(() => {
        // we queue the cleanup functions to be executed after the react state has been updated so that no referecens are lost
        console.log(context.cleanupFunctions)
        while (context.cleanupFunctions.length > 0) {
            console.log(' running cleanup')
            const fn = context.cleanupFunctions.pop()
            fn?.()
        }
    })

    return { setNode, listeners, over, state, transform }

}


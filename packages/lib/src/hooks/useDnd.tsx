import React, { createElement, useContext, useEffect, useRef, useState } from 'react'
import { Context } from '../context/DndContext'
import { DndContext, DndContextX, Element, UniqueId, Vec2, } from '../context/ContextTypes'
import { compareObjects, computeDirection, getElementRect, normalize, todo } from '../utils'
import { computeClosestDroppable } from '../utils'
import { createPortal } from 'react-dom'
import { onPointerDown, onPointerMove, onPointerOut, onPointerUp } from '../context/DragEvents'


interface DndOptions {
    draggable: boolean
    droppable: boolean
    data?: any
}





export interface DirectionType {
    vector: Vec2;
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
    console.log('id ', id)
    const events = {} as Record<string, (ev: React.PointerEvent) => void>
    if (options.draggable) {
        events.onPointerDown = (ev: React.PointerEvent) => onPointerDown(ev, id)
    }
    if (options.droppable) {
        events
    }


    return events
}

interface DndElementState {
    transform: { x: number, y: number }
    over?: boolean
    active?: boolean
}

export const useDnd = (id: UniqueId, { draggable, droppable, data }: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const elemRef = useRef<Element | null>(null)
    const nodeRef = useRef<HTMLElement | null>(null)
    const listeners = getSyntethicListeners(id, { draggable, droppable })
    const [state, setState] = useState<DndElementState>({ transform: { x: 0, y: 0 } })


    const [over, setOver] = useState<OverType>({ isOver: false, direction: null }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }






    useEffect(() => {
        if (nodeRef.current) {
            const elem = context.register(id, nodeRef.current, {
                data,
                draggable,
                droppable,
                callbacks: {
                    onOutsideOver: (ev) => {
                        if (!elemRef.current) return
                        console.log(ev.dnd.pointOfContact)
                        setOver({
                            isOver: true, direction: computeDirection(elemRef.current, ev.dnd.pointOfContact)
                        })
                    },
                    onOutsideOverLeave: (ev) => {
                        console.log('leave')
                        if (!elemRef.current) return
                        setOver({
                            isOver: false, direction: null
                        })
                    },
                    updateState: setState,
                }

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
        /** check on every render if the position has changed, if so update the context */

        const contextElem = context.elements?.get(id)
        if (contextElem && nodeRef.current) {

            // if (!compareObjects(contextElem.rect, getElementRect(nodeRef.current))) {
            // recompute the element box
            // console.log('recalculating')
            // contextElem.rect = getElementRect(nodeRef.current)
            // }
            todo("Recalculate")

        }

    })
    return { setNode, listeners, over }

}


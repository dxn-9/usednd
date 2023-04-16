import React, { createElement, useContext, useEffect, useRef, useState } from 'react'
import { Context, Element, UniqueId, } from '../Context/DndContext'
import { compareObjects, computeDirection, getElementRect, normalize } from '../utils'
import { createPortal } from 'react-dom'


interface DndOptions {
    draggable: boolean
    droppable: boolean
    data?: any
}





export interface DirectionType {
    vector: [number, number];
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



export const useDnd = (id: UniqueId, { draggable, droppable, data }: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const nodeRef = useRef<HTMLElement | null>(null)
    const elemRef = useRef<Element | null>(null)

    const [over, setOver] = useState<OverType>({ isOver: false, direction: null }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }


    const events = {

        onPointerDown: (ev: React.PointerEvent) => {
            context.onPointerDown?.(ev, id)
        },
        onPointerMove: (ev: React.PointerEvent) => {
            /**  limitation of this is that it only will detect when the mouse is inside, so no outside collision detection - could be easily improved */
            if (context.isDragging && nodeRef.current && id === context.overElement?.current?.id) {
                /** lets assume that every element is a box to not make center calculation too hard */
                const newDirection = computeDirection(elemRef.current!, [ev.pageX, ev.pageY])
                setOver({ isOver: true, direction: newDirection })

            }
        },

        onPointerEnter: (ev: React.PointerEvent) => {
            if (context.isDragging && nodeRef.current) {
                setOver({ isOver: true, direction: computeDirection(elemRef.current!, [ev.pageX, ev.pageY]) })
            }
            context.onPointerEnter(ev, id)
        },
        onPointerLeave: (ev: React.PointerEvent) => {
            if (context.isDragging && nodeRef.current) {
                setOver({ isOver: false, direction: null })
            }
            context.onPointerLeave(ev, id)
        },

    }

    useEffect(() => {
        if (nodeRef.current) {
            const elem = context.register(id, nodeRef.current, data, {
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
                }

            })

            elemRef.current = elem

        } else {
            throw new Error(' You need to register an element!')
        }
        return () => {
            context.unregister(id)
        }
    }, [])
    useEffect(() => {
        /** check on every render if the position has changed, if so update the context */

        const contextElem = context.elements?.get(id)
        if (contextElem && nodeRef.current) {

            if (!compareObjects(contextElem.rect, getElementRect(nodeRef.current))) {
                // recompute the element box
                console.log('recalculating')
                contextElem.rect = getElementRect(nodeRef.current)
            }

        }

    })
    return { setNode, events, over }

}


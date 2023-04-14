import React, { createElement, useContext, useEffect, useRef, useState } from 'react'
import { Context, UniqueId, } from '../Context/DndContext'
import { compareObjects, getElementRect } from '../utils'
import { createPortal } from 'react-dom'


interface DndOptions {
    draggable: boolean
    droppable: boolean
}





export const useDnd = (id: UniqueId, options: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const nodeRef = useRef<HTMLElement | null>(null)
    const [over, setOver] = useState<{ isOver: boolean; direction: [number, number] }>({ isOver: false, direction: [0, 0] }) // vector2 representing the direction of the cursor - have to make it an object to avoid impossible states
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
                const newDirection = computeDirection(ev, nodeRef.current!.getBoundingClientRect())
                if (newDirection[0] === over.direction[0] && newDirection[1] === over.direction[1]) {
                    // dont cause re render if direction is the same
                    return
                } else {
                    setOver({ isOver: true, direction: newDirection })
                }

            }
        },

        onPointerEnter: (ev: React.PointerEvent) => {
            if (context.isDragging && nodeRef.current) {
                setOver({ isOver: true, direction: computeDirection(ev, nodeRef.current.getBoundingClientRect()) })
            }
            context.onPointerEnter(ev, id)
        },
        onPointerLeave: (ev: React.PointerEvent) => {
            if (context.isDragging && nodeRef.current) {
                setOver({ isOver: false, direction: [0, 0] })
            }
            context.onPointerLeave(ev, id)
        },

    }

    useEffect(() => {
        if (nodeRef.current) {
            context.register(id, nodeRef.current)
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


function computeDirection(ev: React.PointerEvent, rect: DOMRect): [number, number] {
    const absoluteY = rect.top + rect.height / 2
    const absoluteX = rect.left + rect.width / 2;
    const newDirection: [number, number] = [0, 0]
    if (ev.pageX > absoluteX) {
        newDirection[0] = 1
    } else if (ev.pageX < absoluteX) {
        newDirection[0] = -1
    }
    if (ev.pageY > absoluteY) {
        newDirection[1] = -1
    } else if (ev.pageY < absoluteY) {
        newDirection[1] = 1
    }

    return newDirection;


}
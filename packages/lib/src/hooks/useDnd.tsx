import React, { createElement, useContext, useEffect, useRef, useState } from 'react'
import { Context, UniqueId } from '../Context/DndContext'
import { createPortal } from 'react-dom'


interface DndOptions {
    draggable: boolean
    droppable: boolean
}





export const useDnd = (id: UniqueId, options: DndOptions = { draggable: true, droppable: true }) => {
    const context = useContext(Context)
    const nodeRef = useRef<HTMLElement | null>(null)
    const [isOver, setIsOver] = useState(false)

    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }
    console.log('useDnd render')
    const events = {

        onPointerDown: (ev: React.PointerEvent) => {
            context.onPointerDown?.(ev, id)
        },
        onPointerEnter: (ev: React.PointerEvent) => {
            context.onPointerEnter(id)
            if (context.overElement?.current?.id === id) {
                console.log('is over true', context.overElement)
                setIsOver(true)
            }
        },
        onPointerLeave: (ev: React.PointerEvent) => {
            context.onPointerLeave(id)
            if (isOver) {
                setIsOver(false)
            }
        }

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
    return { setNode, events, isOver }

}


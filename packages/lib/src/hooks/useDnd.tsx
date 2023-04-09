import React, { useContext, useEffect, useRef } from 'react'
import { Context, UniqueId } from '../Context/DndContext'



export const useDnd = (id: UniqueId,) => {
    const context = useContext(Context)
    const nodeRef = useRef<HTMLElement | null>(null)

    const setNode = (node: HTMLElement | null) => {
        nodeRef.current = node // this is to make ts happy 
    }

    console.log(context)
    const events = {
        onDragStart: (ev: React.MouseEvent) => { context.active!.current = id; context.isDragging = true },
        onDragEnd: (ev: React.MouseEvent) => { context.active!.current = undefined; context.isDragging = false }

    }

    useEffect(() => {
        if (nodeRef.current) {
            nodeRef.current.draggable = true
            context.elements?.set(id, {
                rect: nodeRef.current.getClientRects(),

            })

        } else {
            console.log('You need to bind the node!')
        }

        return () => { }
    }, [])
    return { setNode, events }

}
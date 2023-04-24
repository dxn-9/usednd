import React from "react";
import { DndElementRect, UniqueId, Vec2 } from "../context/ContextTypes";
import { getElementRect, pow2, todo } from "../utils";
import { Context } from "../context/DndContext";
import { DndElementEvents, DndPointerEvent } from "../options/DndEvents";
import { Transform } from "../hooks/useDnd";




export class DndElement<T = unknown>  {
    id: UniqueId
    node: HTMLElement
    rect!: DndElementRect;
    draggable: boolean
    droppable: boolean
    movementDelta: Vec2
    initialPoint: Vec2
    isActive: boolean
    isOver: boolean
    transform: Transform
    callbacks?: DndElementEvents
    data?: T

    constructor(id: UniqueId, node: HTMLElement, options: { draggable: boolean, droppable: boolean, callbacks?: DndElementEvents, data?: T }) {
        this.id = id
        this.node = node
        this.draggable = options.draggable
        this.droppable = options.droppable
        this.callbacks = options.callbacks
        this.data = options.data
        this.movementDelta = { x: 0, y: 0 }
        this.initialPoint = { x: 0, y: 0 }
        this.isActive = false
        this.isOver = false
        this.updateRect()
        this.transform = { x: 0, y: 0, scale: 1 }
    }

    public updateRect() {
        this.rect = getElementRect(this.node)
    }
    /** Events  */
    public onDragStart(ev: DndPointerEvent) {
        this.initialPoint = { x: ev.pageX, y: ev.pageY }
        this.isActive = true

        const ctx = Context.getState()
        ctx.activeElement = this
        ctx.isDragging = true
        ctx.isOutside = true

        if (this.callbacks?.onDragStart) {
            this.callbacks.onDragStart({ active: this, over: null, event: ev })
        }

    }
    public onDragEnd(ev: DndPointerEvent) {

        if (this.callbacks?.onDragEnd) {
            this.callbacks.onDragEnd({ active: this })
        }
    }
    public onDragMove(ev: DndPointerEvent) {
        this.movementDelta.x = -(this.initialPoint.x - ev.pageX)
        this.movementDelta.y = -(this.initialPoint.y - ev.pageY)

        if (this.callbacks?.onDragMove) {
            this.callbacks.onDragMove({ active: this })
        }
    }

    public onDrop(ev: DndPointerEvent) {
        console.log('on DROP CALLED')
    }
    public onDragOverStart(ev: DndPointerEvent) {
        const context = Context.getState()

        context.overElement?.onDragOverLeave(ev)
        context.overElement = this
        context.overStack.push(this)
        this.isOver = true

        if (this.callbacks?.onDragOverStart) {
            this.callbacks.onDragOverStart({ active: this })
        }
    }
    public onDragOverMove(ev: DndPointerEvent) {
        todo('onOver - droppable')
    }
    public onDragOverLeave(ev: DndPointerEvent) {
        const context = Context.getState()

        this.isOver = false
        context.overStack.pop()

        if (context.overStack.length > 0) {
            context.overElement = context.overStack[context.overStack.length - 1]
        } else {
            context.overElement = null
        }

        if (this.callbacks?.onDragOverEnd) {
            this.callbacks.onDragOverEnd({ active: this })
        }

    }
    public onActive(ev: DndPointerEvent) {
        todo('onActive - draggable')
    }






}
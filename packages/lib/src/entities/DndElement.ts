import React from "react";
import { DndElementRect, DndElementCallbacks, UniqueId, Vec2 } from "../context/ContextTypes";
import { getElementRect, pow2, todo } from "../utils";
import { Context, xdTest } from "../context/DndContext";

export class DndElement<T = unknown> {
    id: UniqueId
    node: HTMLElement
    rect!: DndElementRect;
    draggable: boolean
    droppable: boolean
    movementDelta: Vec2
    initialPoint: Vec2
    isActive: boolean
    callbacks?: DndElementCallbacks
    data?: T

    constructor(id: UniqueId, node: HTMLElement, options: { draggable: boolean, droppable: boolean, callbacks?: ElementCallbacks, data?: T }) {
        this.id = id
        this.node = node
        this.draggable = options.draggable
        this.droppable = options.droppable
        this.callbacks = options.callbacks
        this.data = options.data
        this.movementDelta = { x: 0, y: 0 }
        this.initialPoint = { x: 0, y: 0 }
        this.isActive = false
        this.updateRect()
    }

    public updateRect() {
        this.rect = getElementRect(this.node)
    }
    /** Events  */
    public onDragStart(ev: PointerEvent) {
        this.initialPoint = { x: ev.pageX, y: ev.pageY }
        this.isActive = true

        const ctx = Context.getState()
        ctx.activeElement = this
        ctx.isDragging = true
        ctx.isOutside = true

        if (this.callbacks?.onActive) {
            todo('onActive')
        }

    }
    public onDragEnd(ev: PointerEvent) {
        this.movementDelta = { x: 0, y: 0 }

        this.isActive = false
        Context.getState().isDragging = false
        console.log('stop active')

        if (this.callbacks.onMove) {
            todo('onMove')
        } else {
            this.node.style.transform = `translate(${this.movementDelta.x}px, ${this.movementDelta.y}px)`
        }
    }
    public onDragMove(ev: PointerEvent) {
        this.movementDelta.x = -(this.initialPoint.x - ev.pageX)
        this.movementDelta.y = -(this.initialPoint.y - ev.pageY)

        if (this.callbacks.onMove) {
            todo('onMove')
        } else {
            this.node.style.transform = `translate(${this.movementDelta.x}px, ${this.movementDelta.y}px)`
        }

    }

    public move(screenPosition: Vec2) {
    }




}
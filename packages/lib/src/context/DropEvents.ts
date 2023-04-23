import React from "react";
import { DndContext, UniqueId } from "./ContextTypes";
import { Context } from "./DndContext";
import { DndCollision } from "../options/DndCollisions";

export function onPointerEnter(ev: React.PointerEvent, elementId: UniqueId) {
    // 	/** When the pointer enters a registered element */
    console.log('POINTER ENTER DROPPABLE')
    const ctx = Context.getState()
    const element = ctx.elements?.get(elementId)
    if (!element) return
    if (ctx.dndProviderProps.collisionDetection === DndCollision.Rect && ctx.isDragging) {
        console.log('pointer enter')
        element.onDragOverStart()

    }
}
export function onPointerLeave(ev: React.PointerEvent, elementId: UniqueId) {
    /** When the pointer exits a registered element */
    const ctx = Context.getState()
    const element = ctx.elements?.get(elementId)
    if (!element) return
    if (ctx.dndProviderProps.collisionDetection === DndCollision.Rect && ctx.isDragging) {
        element.onDragOverLeave()

    }

}
export function onPointerMove(ev: React.PointerEvent, elementId: UniqueId) {
    /** When the pointer exits a registered element */
    const ctx = Context.getState()
    const element = ctx.elements?.get(elementId)
    if (!element) return
    if (ctx.dndProviderProps.collisionDetection === DndCollision.Rect && ctx.isDragging) {
        element.onDragOverMove()

    }

}
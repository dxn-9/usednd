import React from "react"
import { DndContext, UniqueId } from "./ContextTypes"
import { Context } from "./DndContext"

export function onPointerDown(ev: React.PointerEvent, elementId: UniqueId) {
    ev.stopPropagation()
    const ctx = Context.getState()
    const element = ctx.elements.get(elementId)
    if (!element) return
    element.onDragStart(ev as PointerEvent)
}
import React from "react";
import { DndContext, UniqueId } from "./ContextTypes";

export function onPointerEnter(ev: React.PointerEvent, elementId: UniqueId, ctx: DndContext) {
    // 	/** When the pointer enters a registered element */

    if (ctx.isDragging) {


        if (ctx.isOutside) {
            /** Clear the over element */
            ctx.overStack = []
            ctx.overElement = null

        }

        ctx.isOutside = false

        const overEl = ctx.elements?.get(elementId)
        /** activeElement and overElement */
        if (overEl && overEl !== ctx.activeElement) {
            ctx.overStack.push(overEl)
            ctx.overElement = overEl;
        }

        // 	}
        // },
    }
}
export function onPointerLeave(ev: React.PointerEvent, elementId: UniqueId, ctx: DndContext) {
    /** When the pointer exits a registered element */
    ctx.overStack.pop()
    ctx.overElement = ctx.overStack[ctx.overStack.length - 1];

    if (!ctx.overElement) {
        ctx.isOutside = true
    }

}
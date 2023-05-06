import React, { startTransition } from 'react'
import { UniqueId } from './ContextTypes'
import { Context } from './DndContext'
import { CollisionResult, computeClosestPoint, computeIntersectRect, createEventOptions } from '../utils/utils'
import { DndElement } from '../entities/DndElement'
import { DndCollision } from '../options/DndCollisions'

/** ELEMENT EVENTS */
export function onPointerDown(ev: React.PointerEvent, elementId: UniqueId) {
    ev.stopPropagation()
    const ctx = Context.getState()
    const element = ctx.elements.get(elementId)
    if (!element) return
    element.onDragStart(ev)
}


/** DND EVENTS */
export function pointerUp(ev: PointerEvent) {
    const context = Context.getState()
    if (!context.isDragging) return

    startTransition(() => {
        // react stateful updates
        if (context.activeElement && context.overElement && context.lastCollision) {
            context.overElement.onDrop?.(ev)
            context.dndProviderProps.onDrop?.(createEventOptions(ev))
        }

        context.dndProviderProps.onDragEnd?.(createEventOptions(ev))
        context.activeElement?.onDragEnd(ev)
    })

    context.overElement?.onDragOverLeave?.(ev)

    /** Cleanup */
    context.activeElement.movementDelta.x = 0
    context.activeElement.movementDelta.y = 0
    context.activeElement.isActive = false;
    (context.isDragging as boolean) = false;
    (context.activeElement as DndElement | null) = null
}


export function pointerMove(ev: PointerEvent) {
    const context = Context.getState()
    if (!context.isDragging) return
    ev.preventDefault()
    // if its dragging and its not inside a droppable element
    let collision: CollisionResult | null = null
    const { outsideThreshold, collisionDetection, ghost, ...callbacks } = context.dndProviderProps


    if (collisionDetection === DndCollision.ClosestPoint) {
        collision = computeClosestPoint(ev, context)
        if (!collision.success || collision.distance > outsideThreshold) {
            // Collision Failure
            context.lastCollision = null

            context.overElement?.onDragOverLeave?.(ev)
            context.overElement = null
        } else {
            // Collision Success
            context.lastCollision = collision;

            if (collision.element.isOver) {
                /** if its still over the same element, just fire the move */
                collision.element.onDragOverMove(ev)
                callbacks.onDragOverMove?.(createEventOptions(ev))
            } else {
                collision.element?.onDragOverStart(ev)
            }
        }
    }

    if (collisionDetection === DndCollision.RectIntersect) {
        collision = computeIntersectRect(context)

        if (!collision.success) {
            // Collision Failure
            context.lastCollision = null

            context.overElement?.onDragOverLeave?.(ev)
            context.overElement = null
        } else {
            // Collision Success
            context.lastCollision = collision;

            if (collision.element.isOver) {
                collision.element.onDragOverMove(ev)
            } else {
                collision.element.onDragOverStart(ev)
            }
        }
    }
    callbacks.onDragMove?.(createEventOptions(ev))
    context.activeElement.onDragMove(ev)
}
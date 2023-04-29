import React from 'react'
import { DndContext } from '../context/ContextTypes'
import { DndElement } from '../entities/DndElement'
import { Defined } from '../utils/types'
import { CollisionResultSuccess } from '../utils'


export interface DndEventOptions<T = unknown> {
    context: DndContext
    active: DndElement
    over: DndElement | null
    event: DndPointerEvent
}
export interface DndDropEventOptions extends DndEventOptions {
    collision: CollisionResultSuccess
    over: DndElement

}

export type DndPointerEvent = React.PointerEvent | PointerEvent



export interface DndEvents {
    onDragStart(options: DndEventOptions): unknown
    onDragEnd(options: DndEventOptions): unknown
    onDragMove(options: DndEventOptions): unknown
    onDragOverStart(options: DndDropEventOptions): unknown
    onDragOverMove(options: DndDropEventOptions): unknown
    onDragOverEnd(options: DndDropEventOptions): unknown
    onDrop(options: DndDropEventOptions): unknown
}

export interface DndElementEvents extends DndEvents {
    onActive(options: DndEventOptions): unknown
}





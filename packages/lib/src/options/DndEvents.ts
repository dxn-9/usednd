import React from 'react'
import { DndContext } from '../context/ContextTypes'
import { DndElement } from '../entities/DndElement'
import { Defined } from '../utils/types'


export interface DndEventOptions<T = unknown> {
    context: DndContext
    active: DndElement
    over: DndElement | null
    target?: DndElement
    data?: T
    event: DndPointerEvent
}

export type DndPointerEvent = React.PointerEvent | PointerEvent



export interface DndEvents {
    onDragStart(options: DndEventOptions): unknown
    onDragEnd(options: DndEventOptions): unknown
    onDragMove(options: DndEventOptions): unknown
    onDragOverStart(options: DndEventOptions): unknown
    onDragOverMove(options: DndEventOptions): unknown
    onDragOverEnd(options: DndEventOptions): unknown
    onDrop(options: Defined<DndEventOptions, 'over'>): unknown
}

export interface DndElementEvents extends DndEvents {
    onActive(options: DndEventOptions): unknown
}





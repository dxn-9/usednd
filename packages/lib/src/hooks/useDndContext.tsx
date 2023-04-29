import React from 'react'
import { Context } from '../context/DndContext'
export const useDndContext = () => {
    return React.useContext(Context)
}
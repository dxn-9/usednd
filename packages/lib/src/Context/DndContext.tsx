import React, {
	DragEvent,
	PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	startTransition,
} from 'react'
import { DndElement, UniqueId } from '../utils/DndElement'
import { produce, enableMapSet } from 'immer'
import InternalContext from './stores/InternalContext'
enableMapSet()

/* 
STRUCTURE: InternalContext holds all the elements and their state
DndContext is the context responsible for tracking the dragged element state and it will be updated frequently
*/

export const DndProvider = ({ children }: PropsWithChildren) => {
	return <InternalContext>{children}</InternalContext>
}
export default DndProvider

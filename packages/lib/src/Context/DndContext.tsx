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
import { Actions, reducer } from '../utils/reducer'
enableMapSet()

export interface InternalContext {
	dndElements: Map<UniqueId, DndElement>
	active?: DndElement
}

const i_defaultContext: InternalContext = {
	dndElements: new Map<UniqueId, DndElement>(),
}
export const InternalDndContext = createContext<{
	context: InternalContext
	dispatch?: React.Dispatch<Actions>
}>({
	context: i_defaultContext,
	dispatch: undefined,
})

interface DragContext {
	context?: DragState
	move?: (event: MouseEvent) => void
	setActive?: (id: UniqueId) => void
}
interface DragState {
	active?: DndElement
	mouse: { x: number; y: number }
}
export const PublicDndContext = createContext<DragContext>({}) // for now we dont use this

const DndContextProvider = ({ children }: PropsWithChildren<any>) => {
	const [dragCtxVal, setDragCtxVal] = React.useState<DragState>({
		active: undefined,
		mouse: { x: 0, y: 0 },
	})
	const internalContext = useContext(InternalDndContext)
	const publicContext: DragContext = useMemo(
		() => ({
			context: dragCtxVal,
			move: function (event: MouseEvent) {
				if (!dragCtxVal.active) {
					return
				}
				setDragCtxVal((prev) =>
					produce(prev, (draft) => {
						draft.mouse.x = event.clientX
						draft.mouse.y = event.clientY
					})
				)
				const rectActive = dragCtxVal.active.domNode.getBoundingClientRect()
				dragCtxVal.active.position = {
					x: event.clientX - rectActive.x,
					y: event.clientY - rectActive.y,
				}
			},
			setActive: (id: UniqueId) => {
				setDragCtxVal((prev) =>
					produce(prev, (draft) => {
						const c = internalContext.context.dndElements.get(id)
						draft.active = c as DndElement // ??
					})
				)
			},
		}),
		[dragCtxVal]
	)
	console.log(publicContext)
	console.log('inter', internalContext)

	return (
		<PublicDndContext.Provider value={publicContext}>
			{children}
		</PublicDndContext.Provider>
	)
}

/* 
STRUCTURE: InternalContext holds all the elements and their state
DndContext is the context responsible for tracking the dragged element state and it will be updated frequently
*/

export const DndProvider = ({ children }: PropsWithChildren) => {
	const [contextVal, dispatch] = React.useReducer(reducer, i_defaultContext)

	const internalContext = useMemo(() => {
		return {
			dispatch,
			context: contextVal,
		}
	}, [contextVal])

	console.log('context update', internalContext)
	return (
		<InternalDndContext.Provider value={internalContext}>
			<DndContextProvider>{children}</DndContextProvider>
		</InternalDndContext.Provider>
	)
}
export default DndProvider

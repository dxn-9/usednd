import React, { PropsWithChildren, createContext, useEffect, useRef } from "react"


export type UniqueId = string | number

interface DndContext {
	active?: React.MutableRefObject<UniqueId | undefined>
	elements?: Map<UniqueId, {}>
	isDragging: boolean

}

export const Context = createContext<DndContext>({
	active: undefined,
	isDragging: false
})


export const Provider = ({ children }: PropsWithChildren) => {

	const activeElement = useRef<UniqueId>()
	const context = useRef<DndContext>({
		active: activeElement,
		elements: new Map(),
		isDragging: false

	})

	React.useEffect(() => {
		const showState = (ev: KeyboardEvent) => { if (ev.key === 'X') console.log(context.current) }
		window.addEventListener('keydown', showState)
		return () => { window.removeEventListener('keydown', showState) }
	}, [])

	return <Context.Provider value={context.current}>{children}</Context.Provider>
}
export default Provider

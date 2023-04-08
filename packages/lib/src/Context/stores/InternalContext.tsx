import React, { createContext, useRef } from 'react'
import { Actions, reducer } from '../../utils/reducer'
import { DndElement, UniqueId } from '../../utils/DndElement'

export interface InternalContext {
	elements?: Map<UniqueId, DndElement>
}
export const InternalContext = createContext<InternalContext>({
	elements: undefined,
})

const DndContextProvider = ({ children }: React.PropsWithChildren) => {
	const context = useRef<InternalContext>({
		elements: new Map<UniqueId, DndElement>(),
	})

	return (
		<InternalContext.Provider value={context.current}>
			{children}
		</InternalContext.Provider>
	)
}

export default DndContextProvider

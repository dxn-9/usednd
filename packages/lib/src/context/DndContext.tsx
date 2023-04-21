import React, { PropsWithChildren, cloneElement, createContext, useEffect, useMemo, useRef, useState } from "react"
import { compareObjects, computeClosestDroppable } from '../utils'
import { DndContext, DndEvent, ElementCallbacks, ElementRect, UniqueId } from "./ContextTypes"
import { DndElement } from "../entities/DndElement"



interface DndGlobContext extends React.Context<DndContext> {
	getState: () => DndContext
}

export const Context = createContext<DndContext>({ dndProviderProps: {} } as DndContext) as DndGlobContext



export interface DndProviderProps {
	onDrop?: (ev: PointerEvent, active: DndElement, over: DndElement, context: DndContext) => any
	debug?: boolean
	ghost?: () => JSX.Element
	/** distance for mouse to element to trigger the over effect */
	outsideThreshold?: number
}




export const Provider = ({ children, outsideThreshold = 5, ...props }: PropsWithChildren<DndProviderProps>) => {

	const context = useMemo<DndContext>(() => ({
		elements: new Map(),
		isDragging: false,
		isOutside: false,
		dndProviderProps: { outsideThreshold, ...props },
		ghostNode: null,
		overStack: [],
		overElement: null,
		activeElement: null,
		register: (id, node, options) => {

			const element: DndElement = new DndElement(id, node, options)
			context.elements?.set(id, element)
			node.style.touchAction = 'manipulation'
			node.style.userSelect = 'none'
			return element;
		},
		unregister: (id) => {
			context.elements?.delete(id)
		}

	}), []);

	useEffect(() => {

		function pointerUp(ev: PointerEvent) {

			/** Get rid of ghost */
			// if (ghostNode.current && isElement(ghostNode.current)) {
			// 	ghostNode.remove()
			// 	ghostNode.current = null
			// }


			if (context.activeElement && context.overElement) {
				props?.onDrop?.(ev, context.activeElement, context.overElement, context)

				// 	/** Cleanup */
				context.activeElement.node.style.opacity = '1.0'
			}

			context.activeElement?.onDragEnd(ev);
			context.activeElement = null;
			// }
			context.overStack = []
			context.overElement?.callbacks?.onOutsideOverLeave?.({})
			context.overElement = null

		}
		function pointerMove(ev: PointerEvent) {
			if (context.isDragging && context.isOutside) {
				// 		// if its dragging and its not inside a droppable element
				// 		const result = computeClosestDroppable(ev, context.elements, activeElement.current!)
				// 		// console.log('PERFORMANCE:', performance.now() - g)

				// 		if (result.closestDistance < outsideThreshold) {
				// 			if (debug) {
				// 				/** Update debug line if debug - just do it imperatively so it doesnt affect react performance */
				// 				const line = document.querySelector('#dnd-debug-view') as SVGLineElement
				// 				line.setAttribute('x1', ev.pageX.toString())
				// 				line.setAttribute('x2', result.pointOfContact.x.toString())
				// 				line.setAttribute('y1', ev.pageY.toString())
				// 				line.setAttribute('y2', result.pointOfContact.y.toString())
				// 			}


				// 			if (result.closestElement !== overElement.current) {
				// 				/** If it changed element fire the event and change state */

				// 				overElement.current?.callbacks?.onOutsideOverLeave?.({})
				// 				overStack.current[0] = result.closestElement as Element
				// 				overElement.current = result.closestElement;

				// 			}

				// 			result.closestElement?.callbacks?.onOutsideOver?.({
				// 				...ev, dnd: { active: activeElement.current!, over: result.closestElement, pointOfContact: [result.pointOfContact.x, result.pointOfContact.y] }
				// 			})

				// 		}

				// 	}



			}

			if (context.isDragging && context.activeElement) {

				context.activeElement.onDragMove(ev)

			}
		}

		window.addEventListener('pointermove', pointerMove)
		window.addEventListener('pointerup', pointerUp)
		return () => {
			window.removeEventListener('pointermove', pointerMove);
			window.removeEventListener('pointerup', pointerUp);
		}

	}, [])

	useEffect(() => {
		Context.getState = () => context
	}, [context])


	/** Debug */
	useEffect(() => {
		const showState = (ev: KeyboardEvent) => { if (ev.key === 'X') console.log(context) }
		window.addEventListener('keydown', showState)
		return () => { window.removeEventListener('keydown', showState) }

	}, [])


	return <Context.Provider value={context}>
		{props.debug && (<svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} >
			<line x1={0} y1={0} x2={0} y2={0} stroke='red' id="dnd-debug-view"></line>
		</svg>)}
		{children}</Context.Provider>
}
export default Provider



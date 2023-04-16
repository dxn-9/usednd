import React, { PropsWithChildren, cloneElement, createContext, useEffect, useRef, useState } from "react"
import { compareObjects, computeClosestDroppable, getElementRect } from '../utils'

export interface ElementRect {

	angle: number
	left: number
	top: number
	width: number
	height: number
	center: [number, number]
}




export interface DndEvent extends PointerEvent {
	dnd: {
		active: Element
		over: Element
		pointOfContact: [number, number]
	}

}

export interface ElementCallbacks {

	onOutsideOver?: (ev: DndEvent) => any
	/** TODO: */
	onOutsideOverLeave?: (ev: any) => any
}
export interface Element {
	id: UniqueId
	node: HTMLElement
	rect: ElementRect
	draggable: boolean;
	droppable: boolean;
	callbacks?: ElementCallbacks;
	data: any
}

export type UniqueId = string | number

interface DndContext {
	active?: React.MutableRefObject<UniqueId | undefined>
	elements?: Map<UniqueId, Element>
	ghostNode?: React.MutableRefObject<Node | HTMLElement | null>
	activeElement?: React.MutableRefObject<Element | null>
	overElement?: React.MutableRefObject<Element | null>
	overStack?: React.MutableRefObject<Element[]>
	isDragging: boolean
	isOutside: boolean
	onPointerDown: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerEnter: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerLeave: (ev: React.PointerEvent, elementId: UniqueId) => void
	register: (id: UniqueId, node: HTMLElement, data?: any, cb?: ElementCallbacks) => Element
	unregister: (id: UniqueId) => void


}

export const Context = createContext<DndContext>({
	isDragging: false,
	isOutside: false,
	register: () => { return {} as Element },
	unregister: () => { },
	onPointerDown: () => { },
	onPointerEnter: () => { },
	onPointerLeave: () => { },

})



interface Props {
	onDrop?: (ev: PointerEvent, active: Element, over: Element) => any
	debug?: boolean
	/** distance for mouse to element to trigger the over effect */
	outsideThreshold?: number
}
export const Provider = ({ children, onDrop, debug = false, outsideThreshold = 100 }: PropsWithChildren<Props>) => {

	const activeElement = useRef<Element | null>(null)
	const overStack = useRef<Element[]>([])
	const overElement = useRef<Element | null>(null)
	const ghostNode = useRef<Node | HTMLElement | null>(null)
	const context = useRef<DndContext>({
		elements: new Map(),
		isDragging: false,
		isOutside: false,
		ghostNode,
		overStack,
		overElement,
		activeElement,

		onPointerDown: (ev, id) => {
			ev.stopPropagation()
			console.log('pointer down', id)
			const active = context.current?.elements?.get(id)
			if (!active) throw new Error('Something went wrong')
			activeElement.current = active

			const clone = active.node.cloneNode(true)
			document.body.append(clone)
			ghostNode.current = clone;

			if (isElement(ghostNode.current) && active.node) {
				console.log('inside')
				context.current.isDragging = true
				context.current.isOutside = true

				/** Temp styling */
				active.node.style.opacity = '0.5'
				const ghostRect = ghostNode.current.getBoundingClientRect()
				ghostNode.current.style.position = 'absolute';
				ghostNode.current.style.background = 'yellow';
				ghostNode.current.style.top = `-${ghostRect.height}px`;
				ghostNode.current.style.left = `-${ghostRect.width}px`;
				ghostNode.current.style.pointerEvents = 'none'
				active.node.style.cursor = 'move'
				document.body.style.cursor = 'move'
			}

		},
		onPointerEnter: (ev, id) => {
			/** When the pointer enters a registered element */

			if (context.current.isDragging) {

				if (context.current.isOutside) {
					/** Clear the over element */
					overStack.current = []
					overElement.current = null

				}

				context.current.isOutside = false

				const overEl = context.current.elements?.get(id)
				/** activeElement and overElement */
				if (overEl && overEl !== activeElement.current) {
					overStack.current.push(overEl)
					overElement.current = overEl;
				}

			}
		},
		onPointerLeave: (ev, id) => {
			/** When the pointer exits a registered element */
			overStack.current.pop()
			overElement.current = overStack.current[overStack.current.length - 1];

			if (!overElement.current) {
				context.current.isOutside = true
			}

		},
		register: (id, node, data, callbacks = {}) => {

			const rect = getElementRect(node)
			const element: Element = {
				node, id, data, rect, draggable: true,
				droppable: true,
				callbacks,
			}
			context.current.elements?.set(id, element)
			node.style.touchAction = 'manipulation'
			node.style.userSelect = 'none'
			return element
		},
		unregister: (id) => {
			context.current.elements?.delete(id)
		}




	})

	useEffect(() => {

		function pointerMove(ev: PointerEvent) {
			if (context.current.isDragging && context.current.isOutside) {
				// if its dragging and its not inside a droppable element
				// const g = performance.now()
				const result = computeClosestDroppable(ev, context.current.elements!, activeElement.current!)
				// console.log('PERFORMANCE:', performance.now() - g)

				if (result.closestDistance < outsideThreshold) {
					if (debug) {
						/** Update debug line if debug - just do it imperatively so it doesnt affect react performance */
						const line = document.querySelector('#dnd-debug-view') as SVGLineElement
						line.setAttribute('x1', ev.pageX.toString())
						line.setAttribute('x2', result.pointOfContact.x.toString())
						line.setAttribute('y1', ev.pageY.toString())
						line.setAttribute('y2', result.pointOfContact.y.toString())
					}


					if (result.closestElement !== overElement.current) {
						/** If it changed element fire the event and change state */

						overElement.current?.callbacks?.onOutsideOverLeave?.({})
						overStack.current[0] = result.closestElement as Element
						overElement.current = result.closestElement;

					}

					result.closestElement?.callbacks?.onOutsideOver?.({
						...ev, dnd: { active: activeElement.current!, over: result.closestElement, pointOfContact: [result.pointOfContact.x, result.pointOfContact.y] }
					})

				}
			}


			if (ghostNode.current && isElement(ghostNode.current)) {
				ghostNode.current.style.transform = `translate(${ev.pageX + ghostNode.current.clientWidth / 2}px,${ev.pageY + ghostNode.current.clientHeight / 2}px)`
			}
		}

		function pointerUp(ev: PointerEvent) {

			/** Get rid of ghost */
			if (ghostNode.current && isElement(ghostNode.current)) {
				ghostNode.current.remove()
				ghostNode.current = null
			}

			if (activeElement.current && overElement.current) {
				onDrop?.(ev, activeElement.current, overElement.current)

				/** Cleanup */
				activeElement.current.node.style.opacity = '1.0'
				activeElement.current = null;
			}
			overStack.current = []
			overElement.current?.callbacks?.onOutsideOverLeave?.({})
			overElement.current = null
			context.current.isDragging = false

		}
		window.addEventListener('pointermove', pointerMove)
		window.addEventListener('pointerup', pointerUp)
		return () => {
			window.removeEventListener('pointermove', pointerMove);
			window.removeEventListener('pointerup', pointerUp);
		}
	}, [])



	/** Debug */
	useEffect(() => {
		const showState = (ev: KeyboardEvent) => { if (ev.key === 'X') console.log(context.current) }
		window.addEventListener('keydown', showState)
		return () => { window.removeEventListener('keydown', showState) }

	}, [])

	return <Context.Provider value={context.current}>
		{debug && (<svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} >
			<line x1={0} y1={0} x2={0} y2={0} stroke='red' id="dnd-debug-view"></line>
		</svg>)},
		{children}</Context.Provider>
}
export default Provider

function isElement(node: Node): node is HTMLElement {
	return node.isConnected
}


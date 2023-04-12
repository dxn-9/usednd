import React, { PropsWithChildren, cloneElement, createContext, useEffect, useRef } from "react"


export type UniqueId = string | number

interface DndContext {
	active?: React.MutableRefObject<UniqueId | undefined>
	elements?: Map<UniqueId, Element>
	ghostNode?: React.MutableRefObject<Node | HTMLElement | null>
	activeElement?: React.MutableRefObject<Element | null>
	overElement?: React.MutableRefObject<Element | null>
	overStack?: React.MutableRefObject<Element[]>
	isDragging: boolean
	onPointerDown: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerEnter: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerLeave: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerUp: (ev: React.PointerEvent, elementId: UniqueId) => void
	register: (id: UniqueId, node: HTMLElement, data?: any) => void
	unregister: (id: UniqueId) => void


}

export const Context = createContext<DndContext>({
	isDragging: false,
	register: () => { },
	unregister: () => { },
	onPointerDown: () => { },
	onPointerEnter: () => { },
	onPointerLeave: () => { },
	onPointerUp: () => { }

})


interface Element {
	id: UniqueId
	node: HTMLElement
	rect: { left: number; top: number; width: number; height: number; center: [number, number] }
	draggable: boolean;
	droppable: boolean;
	data: any
}

interface Props {
	onDrop?: (ev: React.PointerEvent, active: Element, over: Element) => any
	debug: boolean
}


export const Provider = ({ children, onDrop, debug = false }: PropsWithChildren<Props>) => {



	const activeElement = useRef<Element | null>(null)
	const overStack = useRef<Element[]>([])
	const overElement = useRef<Element | null>(null)
	const ghostNode = useRef<Node | HTMLElement | null>(null)
	const context = useRef<DndContext>({
		elements: new Map(),
		isDragging: false,
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
				context.current.isDragging = true;
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
			if (context.current.isDragging) {
				const overEl = context.current.elements?.get(id)
				/** activeElement and overElement */
				if (overEl && overEl !== activeElement.current) {
					overStack.current.push(overEl)
					overElement.current = overEl;
				}

			}
		},
		onPointerLeave: (ev, id) => {
			overStack.current.pop()
			overElement.current = overStack.current[overStack.current.length - 1];
		},
		onPointerUp: (ev, id) => {


			/** Get rid of ghost */
			if (ghostNode.current && isElement(ghostNode.current)) {
				ghostNode.current.remove()
				ghostNode.current = null
			}

			/** Cleanup */
			if (activeElement.current) {
				activeElement.current.node.style.opacity = '1.0'
				activeElement.current = null;
			}
			overStack.current = []
			context.current.isDragging = false
			if (activeElement.current && overElement.current) {
				onDrop?.(ev, activeElement.current, overElement.current)
			}
		},
		register: (id, node, data) => {

			const geometry = node.getBoundingClientRect()
			console.log('on register geometry', geometry, { ...geometry })
			const center: [number, number] = [geometry.left + geometry.width / 2, geometry.top + geometry.height / 2]
			console.log('registering', id, center)
			context.current.elements?.set(id, {
				node, id, data, rect: {
					center,
					top: geometry.top,
					left: geometry.left,
					width: geometry.width,
					height: geometry.height
				}, // cant spread geometry for some reason?
				draggable: true,
				droppable: true
			})
			node.style.touchAction = 'manipulation'
			node.style.userSelect = 'none'
			console.log('REGISTERED:', context.current.elements)
		},
		unregister: (id) => {
			context.current.elements?.delete(id)
		}




	})

	useEffect(() => {

		function pointerMove(e: PointerEvent) {
			if (activeElement.current && context.current.elements) {
				computeClosestDroppable(e, context.current.elements, activeElement.current)
			}


			if (ghostNode.current && isElement(ghostNode.current)) {
				ghostNode.current.style.transform = `translate(${e.pageX + ghostNode.current.clientWidth / 2}px,${e.pageY + ghostNode.current.clientHeight / 2}px)`
			}
		}
		window.addEventListener('pointermove', pointerMove)
		return () => {
			window.removeEventListener('pointermove', pointerMove);
		}
	}, [])



	/** Debug */
	useEffect(() => {
		const showState = (ev: KeyboardEvent) => { if (ev.key === 'X') console.log(context.current) }
		window.addEventListener('keydown', showState)
		return () => { window.removeEventListener('keydown', showState) }

	}, [])

	return <Context.Provider value={context.current}>{children}</Context.Provider>
}
export default Provider

function isElement(node: Node): node is HTMLElement {
	return node.isConnected
}


function computeClosestDroppable(ev: PointerEvent, allElements: Map<UniqueId, Element>, active?: Element) {

	// max 32bit uint 
	let closestDistance = -1 >>> 1 // other cool way is ~0 >>> 1
	let closestElement: Element | null = null

	let line = { x1: ev.pageX, y1: ev.pageY, x2: 0, y2: 0 }

	for (const [id, element] of allElements) {
		if (element.id === active?.id) continue // do not calculate the active 
		if (!element.droppable) continue

		// {here i could insert a reducer function given by user to calculate available targets based on arbitrary data}


		/** doing a little bit of trigonometry  */

		const distanceToCenter = Math.sqrt(Math.pow(ev.pageX - element.rect.center[0], 2) + Math.pow(ev.pageY - element.rect.center[1], 2))


		const angleSin = (Math.abs(ev.pageY - element.rect.center[1])) / distanceToCenter
		const angleCos = (Math.abs(ev.pageX - element.rect.center[0])) / distanceToCenter

		const length = (element.rect.height / 2) * ((element.rect.width / 2) / (element.rect.height / 2))
		const internalDist = length
		const distance = distanceToCenter - internalDist;

		if (distance < closestDistance) {
			line.x2 = element.rect.center[0] + (ev.pageX > element.rect.center[0] ? angleCos * length : - angleCos * length)
			line.y2 = element.rect.center[1] + (ev.pageY > element.rect.center[1] ? angleSin * length : - angleSin * length)
			closestDistance = distance;
			closestElement = element
		}

	}



	return { closestDistance, closestElement, line }


}
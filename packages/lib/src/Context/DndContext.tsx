import React, { PropsWithChildren, createContext, useEffect, useRef } from "react"


export type UniqueId = string | number

interface DndContext {
	active?: React.MutableRefObject<UniqueId | undefined>
	elements?: Map<UniqueId, Element>
	ghostNode?: React.MutableRefObject<Node | HTMLElement | null>
	activeElement?: React.MutableRefObject<Element | null>
	overElement?: React.MutableRefObject<Element | null>
	isDragging: boolean
	onPointerDown: (ev: React.PointerEvent, elementId: UniqueId) => void
	onPointerEnter: (elementId: UniqueId) => void
	onPointerLeave: (elementId: UniqueId) => void
	register: (id: UniqueId, node: HTMLElement, data?: any) => void
	unregister: (id: UniqueId) => void


}

export const Context = createContext<DndContext>({
	isDragging: false,
	register: () => { },
	unregister: () => { },
	onPointerDown: () => { },
	onPointerEnter: () => { },
	onPointerLeave: () => { }

})


interface Element {
	id: UniqueId
	node: HTMLElement
	data: any
}

interface Props {
	onDrop?: (ev: PointerEvent, active: Element, over: Element) => any
}


export const Provider = ({ children, onDrop }: PropsWithChildren<Props>) => {

	const activeElement = useRef<Element | null>(null)
	const overElement = useRef<Element | null>(null)
	const ghostNode = useRef<Node | HTMLElement | null>(null)
	const context = useRef<DndContext>({
		elements: new Map(),
		isDragging: false,
		ghostNode,
		overElement,
		activeElement,

		onPointerDown: (ev, id) => {
			const active = context.current?.elements?.get(id)
			if (!active) throw new Error('Something went wrong')
			activeElement.current = active
			overElement.current = null

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
		onPointerEnter: (id) => {
			if (context.current.isDragging) {
				const overEl = context.current.elements?.get(id)
				/** activeElement and overElement */
				if (overEl && overEl !== activeElement.current) overElement.current = overEl

			}
		},
		onPointerLeave: (id) => {
			overElement.current = null
		},
		register: (id, node, data) => {
			context.current.elements?.set(id, { node, id, data })
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
			if (ghostNode.current && isElement(ghostNode.current)) {
				ghostNode.current.style.transform = `translate(${e.pageX + ghostNode.current.clientWidth / 2}px,${e.pageY + ghostNode.current.clientHeight / 2}px)`
			}
		}
		function pointerUp(e: PointerEvent) {

			if (activeElement.current && overElement.current) {
				onDrop?.(e, activeElement.current, overElement.current)
			}

			console.log('pointer up', activeElement.current, overElement.current)

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

	return <Context.Provider value={context.current}>{children}</Context.Provider>
}
export default Provider

function isElement(node: Node): node is HTMLElement {
	return node.isConnected
}
import React, {
	useRef,
	useId,
	useCallback,
	useEffect,
	useMemo,
	useLayoutEffect,
	useContext,
} from 'react'
import { InternalContext } from '../Context/stores/InternalContext'
import { DndElement } from '../utils/DndElement'

interface DndOptions {
	virtualize?: boolean
	draggable?: boolean
	id: string
}
const defaultOptions: DndOptions = {
	virtualize: true,
	draggable: true,
	id: '',
}

export const useDnd = (options: DndOptions = defaultOptions) => {
	const internalContext = useContext(InternalContext)

	const nodeRef = useRef<HTMLElement | null>(null)
	const setRef = useCallback((node: HTMLElement | null) => {
		console.log('set ref on node', node)
		nodeRef.current = node
	}, [])

	useIsomorphicEffect(() => {
		console.log('iso')
		if (nodeRef.current && internalContext.elements) {
			const element = new DndElement(options.id, nodeRef.current, {})
			internalContext.elements.set(options.id, element)
		} else {
			console.log('no node set')
		}
		return () => {
			console.log('cleanup')
			const node = internalContext.elements?.get(options.id)
			if (node) {
				console.log('removing')
				internalContext.elements?.delete(options.id)
			} else {
				console.log('no node to remove')
			}
		}
	}, [])

	// const realOpt = { ...defaultOptions, ...options }
	// const id = realOpt.id || useId()
	// const elementRef = useRef<DndElement | undefined>(undefined)
	// const internalContext = React.useContext(InternalDndContext)
	// const publicContext = React.useContext(PublicDndContext)
	// useDndEvents(elementRef)
	// const offset = useMemo(() => {
	// 	if (
	// 		!elementRef.current ||
	// 		!publicContext.context ||
	// 		!publicContext.context.active
	// 	)
	// 		return { x: 0, y: 0 }
	// 	const rect = elementRef.current.domNode.getBoundingClientRect()
	// 	console.log('ins', rect, publicContext.context.mouse)
	// 	return {
	// 		x: rect.x - publicContext.context?.mouse.x,
	// 		y: rect.y - publicContext.context?.mouse.y,
	// 	}
	// }, [publicContext.context?.mouse, elementRef.current])
	// const transform = useMemo(() => {
	// 	if (!elementRef.current) return { x: 0, y: 0 }
	// }, [publicContext.context?.mouse])
	return { setRef }
}

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

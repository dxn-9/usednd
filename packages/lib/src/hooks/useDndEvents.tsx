import React, { useCallback, useState } from 'react'
import { DndElement } from '../utils/DndElement'
import { PublicDndContext } from '../Context/DndContext'

const useDndEvents = (element: React.MutableRefObject<DndElement | undefined>) => {
	const publicContext = React.useContext(PublicDndContext)
	const mouseDownHandler = useCallback((event: MouseEvent) => {
		if (!element.current) return
		console.log('mousedown', event.clientX, element.current.domNode.getClientRects())

		publicContext.setActive?.(element?.current.id)
	}, [])
	const mouseMoveHandler = useCallback((event: MouseEvent) => {
		if (!element.current) return
		publicContext.move?.(event)
	}, [])

	if (element.current) {
		const listeners = element.current.listeners

		if (listeners.drag.mousedown) {
			element.current.domNode.removeEventListener(
				'mousedown',
				listeners.drag.mousedown
			)
		}
		if (listeners.drag.mousemove) {
			element.current.domNode.removeEventListener(
				'mousemove',
				listeners.drag.mousemove
			)
		}
		element.current.domNode.addEventListener('mousedown', mouseDownHandler)
		listeners.drag.mousedown = mouseDownHandler

		element.current.domNode.addEventListener('mousemove', mouseMoveHandler)
		listeners.drag.mousemove = mouseMoveHandler
	}
}
export default useDndEvents

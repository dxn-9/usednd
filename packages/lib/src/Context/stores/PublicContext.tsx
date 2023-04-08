// const internalContext = useContext(InternalDndContext)
// const DndContextProvider = ({ children }: PropsWithChildren<any>) => {
// 	console.log(publicContext)
// 	console.log('inter', internalContext)

// 	return (
// 		<PublicDndContext.Provider value={publicContext}>
// 			{children}
// 		</PublicDndContext.Provider>
// 	)
// }
// const [dragCtxVal, setDragCtxVal] = React.useState<DragState>({
// 	active: undefined,
// 	mouse: { x: 0, y: 0 },
// })
// const publicContext: DragContext = useMemo(
// 	() => ({
// 		context: dragCtxVal,
// 		move: function (event: MouseEvent) {
// 			if (!dragCtxVal.active) {
// 				return
// 			}
// 			setDragCtxVal((prev) =>
// 				produce(prev, (draft) => {
// 					draft.mouse.x = event.clientX
// 					draft.mouse.y = event.clientY
// 				})
// 			)
// 			const rectActive = dragCtxVal.active.domNode.getBoundingClientRect()
// 			dragCtxVal.active.position = {
// 				x: event.clientX - rectActive.x,
// 				y: event.clientY - rectActive.y,
// 			}
// 		},
// 		setActive: (id: UniqueId) => {
// 			setDragCtxVal((prev) =>
// 				produce(prev, (draft) => {
// 					const c = internalContext.context.dndElements.get(id)
// 					draft.active = c as DndElement // ??
// 				})
// 			)
// 		},
// 	}),
// 	[dragCtxVal]
// )
// export const PublicDndContext = createContext<DragContext>({}) // for now we dont use this

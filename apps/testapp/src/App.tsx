import React, { useEffect, useState } from 'react'
import { useDnd, DndProvider } from 'lib'
import './App.css'

function App() {
	const [count, setCount] = useState(0)
	console.log('dnd')

	return (
		<main>
			<DndProvider>{count % 2 == 0 && <Draggable />}</DndProvider>
			<button
				onClick={() => {
					setCount(count + 1)
				}}>
				x
			</button>
		</main>
	)
}

const Draggable: React.FC<React.PropsWithChildren<any>> = () => {
	const { setRef, offset } = useDnd({ id: 'test123' })
	console.log(offset)
	return (
		<div
			ref={setRef}
			style={{
				width: 100,
				height: 100,
				border: '1px solid #fff',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				transform: `translate(${offset?.x}px, ${offset?.y}px)`,
			}}>
			Draggable
		</div>
	)
}

export default App

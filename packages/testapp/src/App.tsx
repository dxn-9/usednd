import React, { useEffect, useState } from 'react'
import { useDnd, Provider } from 'lib'
import './App.css'

function App() {
	const [count, setCount] = useState(0)
	console.log('dnd')

	return (
		<main>
			<Provider>{count % 2 == 0 && <Draggable />}</Provider>
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
	const { setNode, events } = useDnd(1)
	return (
		<div
			ref={setNode}
			style={{
				width: 100,
				height: 100,
				border: '1px solid #fff',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}

			{...events}
		>
			Draggable
		</div>
	)
}

export default App

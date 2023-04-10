import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useDnd, Provider } from 'lib'
import './App.css'

function App() {
	const [count, setCount] = useState(0)

	return (
		<main>
			<Provider onDrop={(ev, active, over) => {

				over.node.append(active.node)

			}}>
				<Draggable />
				<Droppable id={2} />
				<Droppable id={3} />
				<Droppable id={4} />
			</Provider>
		</main>
	)
}

const Draggable: React.FC<React.PropsWithChildren<any>> = () => {
	const { setNode, events } = useDnd(1)
	console.log('hi')
	return (
		<div
			ref={setNode}
			style={{
				width: 100,
				height: 100,
				border: '1px solid #fff',
				display: 'flex',
				justifyContent: 'center',
				touchAction: "manipulation",
				userSelect: 'none',
				alignItems: 'center',
			}}

			{...events}
		>
			Draggable
		</div>
	)
}

const Droppable = ({ children, id }: PropsWithChildren<{ id: number }>) => {

	const { setNode, events, isOver } = useDnd(id)
	console.log(isOver)

	return <div
		ref={setNode}
		{...events}
		style={{
			width: 200,
			height: 200,
			border: '1px solid #fff',
			display: 'flex',
			top: 200 * id,
			left: 200,
			position: 'absolute',
			justifyContent: 'center',
			alignItems: 'center',
			background: isOver ? 'red' : 'green'

		}}

	>
		<p>Droppable</p>

	</div>
}

export default App

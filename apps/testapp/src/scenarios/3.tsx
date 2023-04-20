import { Provider, useDnd } from 'lib'
import React from 'react'
const Scenario3 = () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    return <div className='w-screen flex justify-center items-center'><Provider onDrop={(ev, active, over, context) => { }}>
        <SimpleDraggable /></Provider></div>

}

function SimpleDraggable() {
    const { setNode, listeners } = useDnd(1, { draggable: true, droppable: false })
    return <div className='w-28 h-12 rounded bg-slate-900 text-center' ref={setNode} {...listeners}>Draggable</div>
}

export default Scenario3
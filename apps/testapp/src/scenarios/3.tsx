import { Provider, useDnd } from 'lib'
import React, { useState } from 'react'
import { flushSync } from 'react-dom'
const Scenario3 = () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    console.log('scenario 3 render', position)
    return <div className='w-screen flex justify-center items-center'>
        <Provider onDragEnd={(options) => {
            flushSync(() => setPosition((prev) => {

                console.log('running set position state', options.active)
                return ({
                    x: prev.x + options.active.movementDelta.x, y: prev.y + options.active.movementDelta.y
                })
            }))
            console.log('after set position')
        }}>
            <SimpleDraggable position={position} />
        </Provider>
    </div >

}

function SimpleDraggable({ position }: { position: { x: number, y: number } }) {

    const [T, setT] = useState({ x: 0, y: 0 })

    const { setNode, listeners } = useDnd(1, {
        draggable: true, droppable: false, callbacks: {
            onDragEnd: (o) => {

                console.log('on drag end called comp')
                flushSync(() => setT({ x: 0, y: 0 }))
            }
        }
    })
    console.log('t', T)
    return <div className='w-28 h-12 rounded bg-slate-900 text-center relative' style={{ top: position.y, left: position.x, transform: `translate(0px, 0px) !important` }} ref={setNode} {...listeners}>Draggable</div>
}

export default Scenario3
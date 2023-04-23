import { DndProvider, useDnd } from 'lib'
import React, { useState } from 'react'
import { flushSync } from 'react-dom'
const Scenario3 = () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    console.log('scenario 3 render', position)
    return <div className='w-screen flex justify-center items-center'>
        <DndProvider onDragEnd={(options) => {
            setPosition((prev) => {

                console.log('set position', options.active, options.active.movementDelta.y)

                return ({
                    x: prev.x + options.active.movementDelta.x, y: prev.y + options.active.movementDelta.y
                })
            })
            console.log('after set position')
        }
        }>
            <SimpleDraggable position={position} />
        </DndProvider>
    </div >

}

function SimpleDraggable({ position }: { position: { x: number, y: number } }) {


    const { setNode, listeners, state } = useDnd(1, {
        draggable: true, droppable: false
    })
    console.log('DRAGGABLE RENDER', position, state.transform)
    return <div className={`w-28 h-12 rounded bg-slate-900 text-center relative ${state.active && 'bg-red-500'}`} style={{ top: position.y, left: position.x, transform: `translate(${state.transform.x}px, ${state.transform.y}px)` }} ref={setNode} {...listeners}>Draggable</div>
}

export default Scenario3
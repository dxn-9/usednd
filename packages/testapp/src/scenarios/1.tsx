import { Provider, useDnd } from 'lib'
import React from 'react'

const Scenario1 = () => {
    return <Provider>
        <div className='w-screen h-screen overflow-hidden '>

            <Draggable />
            <div className='w-0 h-0 absolute left-1/2 top-1/2 '>
                {Array.from(Array(10).fill(0)).map((v, i) => <Droppable key={i} style={{ left: (Math.random() - 0.5) * 800, top: (Math.random() - 0.5) * 800 }} idKey={i} id={i} />)}
            </div>
        </div></Provider>

}

const Draggable = () => {
    return <div className='w-10 h-10 bg-yellow-300/10 absolute left-1/2 top-1/2 z-10 '>Drag</div>
}

const Droppable = (props: React.HTMLAttributes<HTMLDivElement> & { idKey: number }) => {
    const { setNode, events } = useDnd(props.idKey)

    return <div ref={setNode} className='bg-red-600/5 w-24 h-24 absolute -translate-x-1/2 -translate-y-1/2' {...props}>Droppable - {props.idKey}</div>
}

export default Scenario1
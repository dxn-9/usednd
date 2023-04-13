import { Provider, useDnd } from 'lib'
import React, { useRef, useState } from 'react'

const Scenario1 = () => {

    const boxesCount = 50
    const [droppedCount, setDroppedCount] = useState<any>({})
    const random = useRef(new Array(boxesCount).fill(0).map((f) => Math.random()))
    console.log('random', random.current)

    return <Provider debug={true} onDrop={(ev, active, over) => {
        setDroppedCount({ ...droppedCount, [over.id]: droppedCount[over.id] ? droppedCount[over.id] + 1 : 1 })
    }}>
        <div className='w-screen h-screen overflow-hidden '>
            <Draggable />
            <div className='w-0 h-0 absolute left-1/2 top-1/2 '>
                {random.current.map((rnd, i) => <Droppable key={i + rnd} style={{ left: (Math.random() - 0.5) * 800, top: (Math.random() - 0.5) * 800 }} idKey={i} droppedCount={droppedCount[i]} />)}
            </div>
        </div>
    </Provider>

}

const Draggable = () => {

    const { setNode, events } = useDnd('drag')

    return <div ref={setNode} className='w-10 h-10 bg-yellow-300/10 absolute left-1/2 top-1/2 z-10' {...events}>Drag</div>
}

const Droppable = (props: React.HTMLAttributes<HTMLDivElement> & { idKey: number; droppedCount?: number }) => {
    const { setNode, events } = useDnd(props.idKey)

    return <div ref={setNode} {...events} className='bg-red-600/5 w-24 h-24 absolute -translate-x-1/2 -translate-y-1/2' {...props}>Droppable - {props.idKey} - Dropped: {props.droppedCount}</div>
}

export default Scenario1
import { Provider, useDnd } from 'lib'
import React, { useRef, useState } from 'react'

const Scenario1 = () => {

    const boxesCount = 10
    const [droppedMap, setDroppedMap] = useState({ ...Array.from({ length: boxesCount }, () => 0) })



    console.log(droppedMap)
    return <Provider debug={true} onDrop={(ev, active, over) => {
        console.log('drop', over, droppedMap)
        setDroppedMap((prev) => ({ ...prev, [over.id]: prev[over.id as keyof typeof prev] as number + 1 }))

    }}>
        <div className='w-screen h-screen overflow-hidden '>
            <Draggable />
            <div className='w-0 h-0 absolute left-1/2 top-1/2 '>
                {Object.keys(droppedMap).map((_, i) => <Droppable key={i} style={{ left: (Math.random() - 0.5) * 800, top: (Math.random() - 0.5) * 800 }} idKey={i} droppedCount={droppedMap[i]} />)}
            </div>
        </div>
    </Provider>

}

const Draggable = () => {

    const { setNode, events } = useDnd('drag')

    return <div ref={setNode} className='w-10 h-10 bg-yellow-300/10 absolute left-1/2 top-1/2 z-10' {...events}>Drag</div>
}

const Droppable = ({ idKey, droppedCount, ...props }: React.HTMLAttributes<HTMLDivElement> & { idKey: number; droppedCount?: number }) => {
    const { setNode, events } = useDnd(idKey)
    const randomWidth = useRef(Math.random())

    return <div ref={setNode} {...events} className={`bg-red-600/5 w-${randomWidth.current > 0.5 ? '24' : '48'} h-24 absolute -translate-x-1/2 -translate-y-1/2`} {...props}>Droppable - {idKey} - Dropped: {droppedCount}</div>
}

export default Scenario1
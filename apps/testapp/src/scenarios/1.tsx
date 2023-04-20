import { Provider, useDnd } from 'lib'
import React, { useMemo, useRef, useState } from 'react'

const Scenario1 = () => {

    const boxesCount = 10
    const [droppedMap, setDroppedMap] = useState({ ...Array.from({ length: boxesCount }, () => 0) })



    console.log(droppedMap)
    return <Provider debug={true} outsideThreshold={10000} onDrop={(ev, active, over) => {
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

    const { setNode, listeners } = useDnd('drag')

    return <div ref={setNode} className='w-10 h-10 bg-yellow-300/10 absolute left-1/2 top-1/2 z-10' {...listeners}>Drag</div>
}

const Droppable = ({ idKey, droppedCount, ...props }: React.HTMLAttributes<HTMLDivElement> & { idKey: number; droppedCount?: number }) => {
    const { setNode, listeners, over } = useDnd(idKey)
    const randomWidth = useRef(Math.random())

    let overStyle = ''
    if (over.direction?.left) {
        overStyle = 'border-l-4 border-red'
    } else if (over.direction?.up) {
        overStyle = 'border-t-4 border-red'
    } else if (over.direction?.down) {
        overStyle = 'border-b-4 border-red'
    } else if (over.direction?.right) {
        overStyle = 'border-r-4 border-red'
    }





    return <div ref={setNode} {...listeners} className={`bg-red-600/5 w-${randomWidth.current > 0.5 ? '24' : '48'} h-24 absolute -translate-x-1/2 -translate-y-1/2 ${overStyle}`} {...props}>Droppable - {idKey} - Dropped: {droppedCount}</div>
}

export default Scenario1
import { DndProvider, useDnd } from '@dandn/usednd'
import { DndCollision } from '@dandn/usednd'
import { CSSTransform } from '@dandn/usednd'
import React, { useRef, useState } from 'react'

const Scenario = () => {
    const boxesCount = 10
    const [droppedMap, setDroppedMap] = useState({
        ...Array.from({ length: boxesCount }, () => 0),
    })

    return (
        <DndProvider
            debug={true}
            outsideThreshold={10000}
            collisionDetection={DndCollision.ClosestPoint}
            onDrop={(options) => {
                options.over.id
                setDroppedMap((prev) => ({
                    ...prev,
                    [options.over.id]: (prev[options.over.id as keyof typeof prev] as number) + 1,
                }))
            }}
        >
            <div className="w-screen h-screen overflow-hidden ">
                <Draggable />
                <div className="w-0 h-0 absolute left-1/2 top-1/2 ">
                    {Object.keys(droppedMap).map((_, i) => (
                        <Droppable
                            key={i}
                            style={{
                                left: (Math.random() - 0.5) * 800,
                                top: (Math.random() - 0.5) * 800,
                            }}
                            idKey={i}
                            droppedCount={droppedMap[i]}
                        />
                    ))}
                </div>
            </div>
        </DndProvider>
    )
}

const Draggable = () => {
    const { setNode, listeners, transform } = useDnd('drag')

    return (
        <div
            ref={setNode}
            className="w-10 h-10 bg-yellow-300/10 absolute left-1/2 top-1/2 z-10"
            {...listeners}
            style={{ transform: CSSTransform(transform) }}
        >
            Drag
        </div>
    )
}

const Droppable = ({
    idKey,
    droppedCount,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    idKey: number
    droppedCount?: number
}) => {
    const { setNode, listeners, over } = useDnd(idKey, { draggable: false, droppable: true })
    const randomWidth = useRef(Math.random())

    let overStyle = ''
    if (over.direction?.left) {
        overStyle += 'border-l-4 border-red '
    }
    if (over.direction?.top) {
        overStyle += 'border-t-4 border-red '
    }
    if (over.direction?.bottom) {
        overStyle += 'border-b-4 border-red '
    }
    if (over.direction?.right) {
        overStyle += 'border-r-4 border-red '
    }

    return (
        <div
            ref={setNode}
            {...listeners}
            className={`bg-red-600/5 ${over.isOver && 'bg-white/20'} w-${randomWidth.current > 0.5 ? '24' : '48'
                } h-24 absolute -translate-x-1/2 -translate-y-1/2 ${overStyle}`}
            {...props}
        >
            Droppable - {idKey} - Dropped: {droppedCount}
        </div>
    )
}

export default Scenario

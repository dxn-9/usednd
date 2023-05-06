import { DndProvider, useDnd } from '@dandn/usednd'
import { DndCollision } from '@dandn/usednd'
import { CSSTransform } from '@dandn/usednd'
import React, { useRef, useState } from 'react'

const Scenario = () => {
    const boxesCount = 10
    const [droppedMap, setDroppedMap] = useState<{ x: number; y: number; count: number }[]>(
        Array.from({ length: boxesCount }, () => ({ x: Math.random() - 0.5, y: Math.random() - 0.5, count: 0 }))
    )

    const [debugLine, setDebugLine] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 })

    // useEffect(() => {
    //     rand.current = Math.random()
    // },[droppedMap])

    return (
        <DndProvider
            outsideThreshold={10000}
            collisionDetection={DndCollision.ClosestPoint}
            onDrop={(options) => {
                setDroppedMap((prev) => {
                    if (!options.over) return prev

                    const newState = structuredClone(prev)
                    const prevBox = newState[options.over.id as number]
                    prevBox.count++
                    return newState
                })
            }}
            onDragMove={(options) => {
                if (options.collision?.pointOfContact && options.over) {
                    const newLine = {
                        x1: options.event.pageX,
                        y1: options.event.pageY,
                        x2: options.collision.pointOfContact.x + options.collision.element.rect.center.x,
                        y2: options.collision.pointOfContact.y + options.collision.element.rect.center.y,
                    }
                    setDebugLine(newLine)
                }
            }}
        >
            <div className="w-full h-full">
                <svg className="absolute w-full h-full">
                    <line x1={debugLine.x1} x2={debugLine.x2} y1={debugLine.y1} y2={debugLine.y2} stroke="red" />
                </svg>

                <Draggable />

                <div className="absolute w-full h-full overflow-hidden">
                    <div className="absolute w-0 h-0 left-1/2 top-1/2  ">
                        {droppedMap.map((e, i) => (
                            <Droppable
                                key={i}
                                style={{
                                    left: e.x * 800,
                                    top: e.y * 800,
                                }}
                                idKey={i}
                                droppedCount={e.count}
                            />
                        ))}
                    </div>
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
            className={`bg-red-600/5 ${
                over.isOver && 'bg-white/20'
            } w-24 h-24 absolute -translate-x-1/2 -translate-y-1/2 ${overStyle}`}
            {...props}
        >
            Droppable - {idKey} - Dropped: {droppedCount}
        </div>
    )
}

export default Scenario

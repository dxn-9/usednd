import { DndProvider, useDnd } from '@dandn/usednd'
import { UniqueId } from '@dandn/usednd'
import { CSSTransform } from '@dandn/usednd'

import React, { PropsWithChildren } from 'react'
const Scenario4 = () => {
    const [belong, setBelongs] = React.useState<UniqueId>(-1)

    return (
        <DndProvider
            onDragEnd={(op) => {
                setBelongs(op.over?.id ?? -1)
            }}
        >
            <div className="flex items-center justify-center">
                <div className="w-28">{belong === -1 && <Draggable />}</div>
                <div className="grid-cols-2 grid ml-52 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Droppable id={i} key={i}>
                            {belong === i && <Draggable />}
                        </Droppable>
                    ))}
                </div>
            </div>
        </DndProvider>
    )
}
function Draggable() {
    const { setNode, listeners, transform } = useDnd(`draggable`, {
        draggable: true,
        droppable: false,
    })
    return (
        <div
            ref={setNode}
            className="bg-slate-600 rounded-md  h-12 w-20 z-10 relative"
            {...listeners}
            style={{ transform: CSSTransform(transform) }}
        >
            Draggable
        </div>
    )
}

function Droppable({ id, children }: PropsWithChildren<{ id: number }>) {
    const { setNode, listeners, over } = useDnd(id, {
        draggable: false,
        droppable: true,
    })
    return (
        <div
            ref={setNode}
            {...listeners}
            className={`bg-gradient-to-r from-indigo-600 to-red-600  border-2 relative border-black w-52 h-52 ${over.isOver && 'border-red-500'
                } `}
        >
            Droppable
            {children}
        </div>
    )
}

export default Scenario4

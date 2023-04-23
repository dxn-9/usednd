import { DndProvider, useDnd } from 'lib'
import React, { PropsWithChildren } from 'react'
const Scenario4 = () => {
    return <DndProvider>
        <div className='flex items-center justify-center'>
            <Draggable />
            <div className='grid-cols-2 grid ml-52 gap-3'>
                <Droppable id={0} >
                    <Droppable id={5} />
                </Droppable>
                <Droppable id={1} />
                <Droppable id={2} />
            </div>
        </div>
    </DndProvider>

}
function Draggable() {
    const { setNode, listeners, state } = useDnd(`draggable`, { draggable: true, droppable: false })
    return <div ref={setNode} className='bg-slate-600 rounded-md h-12 relative' {...listeners} style={{ left: 265, top: -141 }}>Draggable</div>
}

function Droppable({ id: number, children }: PropsWithChildren<{ id: number }>) {
    const { setNode, listeners, state } = useDnd(`droppable-${number}`, { draggable: false, droppable: true })
    return <div ref={setNode} {...listeners} className={`bg-gray-500 border-2 relative border-black w-52 h-52 ${state.over && 'border-red-500'} `}>Droppable
        {children}
    </div>
}
export default Scenario4
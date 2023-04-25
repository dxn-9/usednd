import { DndProvider, useDnd } from 'lib'
import { DndCollision } from 'lib/src/options/DndCollisions'
import { CSSTransform } from 'lib/src/utils'
import React, { PropsWithChildren, useState } from 'react'


interface Folder {

    id: string
    name: string
    subfolders?: Folder[]
}


const mockData: Folder[] = [
    {
        id: "f1",
        name: "Folder 1",
        subfolders: [
            {
                id: "f2fqwe",
                name: "Subfolder 1"
            },
            {
                id: "f9xx",
                name: "Subfolder 2"
            },
            {
                id: "f4123",
                name: "Subfolder 3"
            }
        ]
    },

    {
        id: "f2",
        name: "Folder 2",
        subfolders: [
            {
                id: "f232",
                name: "Subfolder 4"
            },
            {
                id: "f3d",
                name: "Subfolder 5"
            },
            {
                id: "f4x",
                name: "Subfolder 6"
            }
        ]
    },
    {
        id: "f3",
        name: "Folder 3",
        subfolders: [
            {
                id: "f23qew2",
                name: "Subfolder 7"
            },
            {
                id: "f3dqweqw",
                name: "Subfolder 8"
            },
            {
                id: "f4qweqxx",
                name: "Subfolder 9"
            }
        ]
    }
]


const Scenario2 = () => {


    const [folderState, setFolderState] = useState<Folder[]>(mockData)

    return <div className='flex w-screen items-center justify-center flex-col'>
        <DndProvider collisionDetection={DndCollision.RectIntersectArea} onDrop={(ev) => {
            const o_data = ev.over?.data as any
            const a_data = ev.active?.data as any
            const o_isFolder = o_data.order?.length === 1
            const a_isFolder = o_data.order?.length === 1

            if (o_isFolder || a_isFolder) {

            } else {
                // subfolder
                setFolderState((prev) => {
                    const copy = JSON.parse(JSON.stringify(prev)) as Folder[]
                    const o_folder = o_data.order[0]
                    const o_subfolder = o_data.order[1]
                    const a_folder = a_data.order[0]
                    const a_subfolder = a_data.order[1]

                    const droppedOn = copy[o_folder].subfolders?.[o_subfolder] as Folder
                    const activeFolder = copy[a_folder].subfolders?.[a_subfolder] as Folder
                    const direction = ev.over?.overPointOfContact?.normalize().toDirection()
                    let modifier = direction?.bottom ? 1 : 0
                    modifier += a_folder === o_folder && a_subfolder < o_subfolder ? -1 : 0

                    const targetIndex = o_subfolder + modifier
                    console.log('target index', targetIndex)

                    copy[a_folder].subfolders = [...copy[a_folder].subfolders!.slice(0, a_subfolder), ...copy[a_folder].subfolders!.slice(a_subfolder + 1)]
                    copy[o_folder].subfolders = copy[o_folder].subfolders!.slice(0, targetIndex).concat([activeFolder]).concat(copy[o_folder].subfolders!.slice(targetIndex,))

                    return copy

                })
            }
        }}>
            {folderState.map((folder, index) => <ParentFolder key={folder.id} folder={folder} index={index} />)}
        </DndProvider>
    </div >
}



const ParentFolder = ({ children, folder, index }: PropsWithChildren<{ folder: Folder, index: number }>) => {
    const { setNode, listeners, transform, state } = useDnd(`folder-${folder.id}`, {
        draggable: true,
        droppable: true,
        data: {
            order: [index]
        }
    })

    return <div className='w-64 bg-orange-400  flex flex-col border border-black p-1' ref={setNode} {...listeners} style={{ transform: CSSTransform(transform), background: state.over ? 'red' : '' }}>
        <p>{folder.name} - {folder.id}</p>
        <div className='flex flex-col gap-2'>
            {folder.subfolders?.map((subfolder, subIndex) => <Subfolder key={subfolder.id} folder={subfolder} parentIndex={index} index={subIndex} />)}

        </div>
    </div>

}


const Subfolder = ({ children, folder, parentIndex, index }: PropsWithChildren<{ folder: Folder, parentIndex: number, index: number }>) => {

    const { state, setNode, listeners, transform, over } = useDnd(`subfolder-${folder.id}`, {
        draggable: true, droppable: true, callbacks: {
            onDragStart: (op) => {
                // op.active.node.parentElement!.style.zIndex = '9999'
            },

        },
        data: {
            order: [parentIndex, index]
        }
    })
    let overClasses = ''
    if (over) {
        if (over?.direction?.top) overClasses += 'border-t-8 '
        if (over?.direction?.left) overClasses += 'border-l-8 '
        if (over?.direction?.right) overClasses += 'border-r-8 '
        if (over?.direction?.bottom) overClasses += 'border-b-8 '
    } else {
        overClasses = ''
    }


    return <div className={`w-full h-8 bg-blue-400 flex ${over.isOver ? 'bg-blue-200' : ''}  flex-col relative  border-blue-500  ${overClasses}`} ref={setNode} {...listeners} style={{ transform: CSSTransform(transform), background: state.over ? 'green' : '' }}>
        <p> SUB : {folder.name} - {folder.id} - {parentIndex}-{index} </p>
    </div>
}
export default Scenario2
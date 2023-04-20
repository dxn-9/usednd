import { Provider, useDnd } from 'lib'
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
                id: "f2",
                name: "Subfolder 1"
            },
            {
                id: "f3",
                name: "Subfolder 2"
            },
            {
                id: "f4",
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
        <Provider>
            {folderState.map((folder) => <ParentFolder folder={folder} />)}
        </Provider>
    </div>
}



const ParentFolder = ({ children, folder }: PropsWithChildren<{ folder: Folder }>) => {
    const { setNode, events } = useDnd(`folder-${folder.id}`)

    return <div className='w-64 bg-orange-400 border border-black p-1' ref={setNode} {...events}>
        <p>{folder.name} - {folder.id}</p>
        <div className='flex flex-col gap-2' >
            {folder.subfolders?.map((subfolder) => <Subfolder folder={subfolder} />)}
        </div>
    </div>

}


const Subfolder = ({ children, folder }: PropsWithChildren<{ folder: Folder }>) => {

    return <div className='w-full h-8 bg-blue-400 border border-slate-500'>
        <p> SUB : {folder.name} - {folder.id} </p>
    </div>
}
export default Scenario2
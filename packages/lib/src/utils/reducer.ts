import { produce } from 'immer'
import { InternalContext } from '../Context/DndContext'

export type Actions = {
    type: 'add' | 'remove' | 'register' | 'unregister' | 'move'
    payload: any // TODO: fix typing based on action type
}

export function reducer(state: InternalContext, action: Actions) {
    if (action.type === 'add') {
        const newState = produce(state, (draft) => {
            draft.dndElements.set(action.payload.id, action.payload)
        })
        return newState
    }
    if (action.type === 'remove') {
        // const newState = produce(state, (draft) => {
        // 	draft.dndElements.delete(action.payload)
        // })
    }

    return state
}
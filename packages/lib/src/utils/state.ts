import { Context } from "../context/DndContext";

export function updateState() {
    const state = Context.getState()


    while (state.cleanupFunctions.length > 0) {
        const fn = state.cleanupFunctions.pop()
        fn?.()
    }


}
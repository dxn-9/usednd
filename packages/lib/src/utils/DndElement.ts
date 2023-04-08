export type UniqueId = string
interface DndEvents {
    drag?: boolean
    drop?: boolean
    sort?: boolean
}

export class DndElement {
    public id: UniqueId;
    public domNode: HTMLElement
    public events: DndEvents
    public position: {
        x: number
        y: number
    }
    public size: {
        width: number;
        height: number
    }
    public listeners: {
        drag: {
            mousemove?: (ev: MouseEvent) => void[]
            mouseup?: (ev: MouseEvent) => void[]
            mousedown?: (ev: MouseEvent) => void[]
        },
        drop: ((ev: MouseEvent) => void)[],
        sort: ((ev: MouseEvent) => void)[]
    }
    constructor(id: UniqueId, domNode: HTMLElement, events: DndEvents) {
        this.id = id;
        this.domNode = domNode;
        this.events = events

        this.position = {
            x: 0,
            y: 0,
        }
        this.size = {
            width: this.domNode.getBoundingClientRect().width,
            height: this.domNode.getBoundingClientRect().height,
        }
        this.listeners = {
            drag: {

            },
            drop: [],
            sort: []
        }
    }
    public registerEvents() {
    }
}
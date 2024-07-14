import mitt from 'mitt'
import type { EventType } from 'mitt'

export default class Emitter<Events extends Record<EventType, unknown>> {
    private _on
    get on() {
        return this._on
    }

    private _off
    get off() {
        return this._off
    }

    protected emit

    constructor() {
        //@ts-expect-error
        const emitter = mitt<Events>()
        
        this._on = emitter.on
        this._off = emitter.off
        this.emit = emitter.emit
    }
}
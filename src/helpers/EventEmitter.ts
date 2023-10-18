import mitt from 'mitt'

export default class Mitt {
    _on: any
    get on() {
        return this._on
    }

    _off: any

    get off() {
        return this._off
    }

    protected emit: any

    constructor() {
        // @ts-expect-error
        const emitter = mitt()
  
        Object.keys(emitter).forEach(() => {
            this._on = emitter['on']
            this._off = emitter['off']
            this.emit = emitter['emit']
        })
    }
}
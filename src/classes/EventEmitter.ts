import mitt from 'mitt'

export default class Mitt {
    on: any
    emit: any
    off: any
    constructor() {
        // @ts-expect-error
        const emitter = mitt()
  
        Object.keys(emitter).forEach(() => {
            this.on = emitter['on']
            this.off = emitter['off']
            this.emit = emitter['emit']
        })
    }
}
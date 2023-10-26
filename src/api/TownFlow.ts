//import * as fn from '../utils/functions.js'
import { Map } from '../Map.js'

import Mitt from '../helpers/EventEmitter.js'

export class TownFlow extends Mitt {
    #map: Map

    get map() { return this.#map }

    constructor(map: Map) {
        super()
        this.#map = map
    }
}
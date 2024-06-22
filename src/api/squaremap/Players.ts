import Squaremap from "./Squaremap.js"

import {
    EntityApi
} from "helpers/EntityApi.js"

import { Player } from "types"
import { NotFoundError } from "utils/errors.js"

class Players implements EntityApi<Player | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }
    
    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = (...names: string[]): Promise<any> => {
        return null
    }
    
    readonly all = (): Promise<any> => {
        return null
    }
}   

export {
    Players,
    Players as default
}
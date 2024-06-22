import type Squaremap from "./Squaremap.js"

import type {
    EntityApi
} from "helpers/EntityApi.js"

import type { Player } from "types"
import type { NotFoundError } from "utils/errors.js"

class Players implements EntityApi<Player | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }
    
    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]): Promise<any> => {
        return null
    }
    
    readonly all = async(): Promise<any> => {
        return null
    }
}

export {
    Players,
    Players as default
}
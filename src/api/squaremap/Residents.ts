import type Squaremap from "./Squaremap.js"

import type { EntityApi } from "helpers/EntityApi.js"
import type { Resident } from "types"
import type { NotFoundError } from "utils/errors.js"

class Residents implements EntityApi<Resident | NotFoundError> {
    #map: Squaremap
    
    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]): Promise<any> => {
        this.#map.Nations.all()
        
        return null
    }
    
    readonly all = async(): Promise<any> => {
        return null
    }
}

export {
    Residents,
    Residents as default
}
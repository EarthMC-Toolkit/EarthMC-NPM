import { NotFoundError } from "utils/errors.js"
import { EntityApi } from "helpers/EntityApi.js"
import { Nation } from "types"

import Squaremap from "./Squaremap.js"

class Nations implements EntityApi<Nation | NotFoundError> {
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
    Nations,
    Nations as default
}
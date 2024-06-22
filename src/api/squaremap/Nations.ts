import { FetchError, type NotFoundError } from "utils/errors.js"
import type { EntityApi } from "helpers/EntityApi.js"
import type { Nation } from "types"

import type Squaremap from "./Squaremap.js"
import { getExisting } from "utils/functions.js"

class Nations implements EntityApi<Nation | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]): Promise<any> => {
        const nations = await this.all()
        if (!nations) throw new FetchError('Error fetching nations! Please try again.')
    
        const existing = getExisting(nations, names, 'name')
        return existing.length > 1 ? Promise.all(existing): Promise.resolve(existing[0])
    }
    
    readonly all = async(): Promise<any> => {
        return null
    }
}

export {
    Nations,
    Nations as default
}
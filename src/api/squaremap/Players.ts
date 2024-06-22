import type Squaremap from "./Squaremap.js"

import type {
    EntityApi
} from "helpers/EntityApi.js"

import type { Player } from "types"
import { FetchError, type NotFoundError } from "utils/errors.js"
import { getExisting } from "utils/functions.js"

class Players implements EntityApi<Player | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }
    
    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]) => {
        const players = await this.all()
        if (!players) throw new FetchError('Error fetching players! Please try again.')
        
        const existing = getExisting(players, names, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }
    
    readonly all = async() => {
        return null as Player[]
    }
}

export {
    Players,
    Players as default
}
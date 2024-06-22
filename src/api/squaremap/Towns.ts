import type Squaremap from "./Squaremap.js"
import type { SquaremapTown } from "types"

import type { EntityApi } from "helpers/EntityApi.js"
import { parseTowns } from "./parser.js"

import { FetchError, type NotFoundError } from "utils/errors.js"
import { getExisting } from "utils/functions.js"

class Towns implements EntityApi<SquaremapTown | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]) => {
        const towns = await this.all()
        if (!towns) throw new FetchError('Error fetching towns! Please try again.')

        const existing = getExisting(towns, names, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async(_removeAccents = false): Promise<SquaremapTown[]> => {
        const cachedTowns: SquaremapTown[] = this.map.getFromCache('towns')
        if (cachedTowns) return cachedTowns

        const markerset = await this.map.markerset()
        const towns = await parseTowns(markerset)

        if (towns.length > 0) {
            this.map.putInCache('towns', towns)
            this.map.unrefIfNode()
        }

        return towns
    }
}

export {
    Towns,
    Towns as default
}
import Squaremap from "./Squaremap.js"

import { EntityApi } from "../../helpers/EntityApi.js"
import { NotFoundError } from "../../utils/errors.js"
import { SquaremapTown } from "../../types.js"
import { parseTowns } from "./parser.js"

class Towns implements EntityApi<SquaremapTown | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
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

    readonly get = async(..._list: string[]): Promise<SquaremapTown | SquaremapTown[]> => {
        return null
    }
}

export {
    Towns,
    Towns as default
}
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
        const markerset = await this.map.markerset()
        const out = await parseTowns(markerset)

        return out
    } 

    readonly get = async(..._list: string[]): Promise<SquaremapTown | SquaremapTown[]> => {
        return null
    }
}

export {
    Towns,
    Towns as default
}
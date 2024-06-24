import type Squaremap from "./Squaremap.js"

import { FetchError, type NotFoundError } from "../../utils/errors.js"
import type { EntityApi } from "../../helpers/EntityApi.js"
import type { Nation, SquaremapTown, StrictPoint2D } from "../../types"

import { getExisting, sqr } from "../../utils/functions.js"

import { getNearest } from "../common.js"
import { parseNations } from "./parser.js"

class Nations implements EntityApi<Nation | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]) => {
        const nations = await this.all()
        if (!nations) throw new FetchError('Error fetching nations! Please try again.')
    
        const existing = getExisting(nations, names, 'name')
        return existing.length > 1 ? Promise.all(existing): Promise.resolve(existing[0])
    }
    
    readonly all = async(towns?: SquaremapTown[]) => {
        if (!towns) {
            towns = await this.map.Towns.all()
            if (!towns) throw new Error() // TODO: Implement appropriate error.
        }

        return parseNations(towns)
    }

    readonly nearby = async (location: StrictPoint2D, radius: StrictPoint2D, nations?: Nation[]) => 
        getNearest<Nation>(location, radius, nations, this.all)

    readonly joinable = async (townName: string, nationless = true) => {
        let town: SquaremapTown = null
        try {
            town = await this.map.Towns.get(townName) as SquaremapTown
        } catch (_) {
            throw new FetchError(`Specified town '${townName}' does not exist!`)
        }

        const nations = await this.all(this.map.getFromCache('towns'))
        if (!nations) throw new FetchError('Error fetching nations! Please try again.')

        return nations.filter(n => {
            const joinable = sqr(n.capital, town, this.map.inviteRange)
            return nationless ? joinable && town.nation == "No Nation" : joinable
        }) as Nation[]
    }
}

export {
    Nations,
    Nations as default
}
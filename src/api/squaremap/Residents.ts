import type Squaremap from "./Squaremap.js"

import type { EntityApi } from "helpers/EntityApi.js"
import type { Resident, SquaremapTown } from "types"
import { InvalidError, type NotFoundError } from "utils/errors.js"
import { getExisting } from "utils/functions.js"
import { parseResidents } from "./parser.js"

class Residents implements EntityApi<Resident | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly fromTown = async(townName: string) => {
        if (!townName) throw new InvalidError(`Parameter 'town' is ${townName}`)

        const town = await this.map.Towns.get(townName) as SquaremapTown
        if (town instanceof Error) throw town

        return await this.get(...town.residents)
    }

    readonly get = async(...names: string[]) => {
        const residents = await this.all()
        const existing = getExisting(residents, names, 'name')

        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }
    
    readonly all = async() => {
        const towns = await this.map.Towns.all()

        // TODO: Cache residents to avoid parsing every time.
        return parseResidents(towns)
    }
}

export {
    Residents,
    Residents as default
}
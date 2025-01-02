import type Squaremap from "./Squaremap.js"
import type { 
    SquaremapNation, SquaremapTown, 
    StrictPoint2D 
} from "../../types/index.js"

import type { EntityApi } from "../../helpers/EntityApi.js"
import { parseTowns } from "./parser.js"

import { 
    FetchError, InvalidError, 
    NotFoundError 
} from "../../utils/errors.js"

import { getExisting, isInvitable } from "../../utils/functions.js"
import { getNearest } from "../common.js"

class Towns implements EntityApi<SquaremapTown | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }

    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly fromNation = async(nationName: string) => {
        if (!nationName) throw new InvalidError(`Parameter 'nation' is ${nationName}`)

        const nation = await this.map.Nations.get(nationName) as SquaremapNation
        if (nation instanceof Error) throw nation

        return await this.get(...nation.towns)
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
            //this.map.unrefIfNode()
        }

        return towns
    }

    readonly nearby = async (location: StrictPoint2D, radius: StrictPoint2D, towns?: SquaremapTown[]) => 
        getNearest<SquaremapTown>(location, radius, towns, this.all)

    // TODO: Maybe put this into common.ts ?
    readonly invitable = async(nationName: string, includeBelonging = false) => {
        const nation = await this.map.Nations.get(nationName) as SquaremapNation
        if (nation instanceof NotFoundError) throw new Error("Error checking invitable: Nation does not exist!")
        if (!nation) throw new Error("Error checking invitable: Could not fetch the nation!")
        
        const towns = await this.all()
        if (!towns) throw new FetchError('An error occurred fetching towns!')

        return towns.filter(t => isInvitable(t, nation, this.map.inviteRange, includeBelonging))
    }

    // readonly totalWealth = async() => {
    //     // Could do this with nations instead, but towns is likely to be more reliable.
    //     const towns = await this.all()
    //     return towns.reduce((acc, town) => acc + town.wealth || 0, 0) 
    // }
}

export {
    Towns,
    Towns as default
}
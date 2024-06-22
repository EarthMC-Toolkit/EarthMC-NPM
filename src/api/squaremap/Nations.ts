import { FetchError, type NotFoundError } from "utils/errors.js"
import type { EntityApi } from "helpers/EntityApi.js"
import type { Nation, SquaremapTown } from "types"

import type Squaremap from "./Squaremap.js"
import { getExisting, removeDuplicates } from "utils/functions.js"

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

        const raw: Record<string, Nation> = {}
        const nations: Nation[] = []
        const len = towns.length

        for (let i = 0; i < len; i++) {
            const town = towns[i]
            
            const nationName = town.nation
            if (nationName == "No Nation") continue
    
            // Doesn't already exist, create new.
            if (!raw[nationName]) {          
                raw[nationName] = { 
                    name: nationName,
                    residents: town.residents,
                    towns: [],
                    area: 0,
                    king: undefined,
                    capital: undefined
                }
    
                nations.push(raw[nationName])
            }
    
            //#region Add extra stuff
            raw[nationName].residents = removeDuplicates(raw[nationName].residents.concat(town.residents))       
            raw[nationName].area += town.area
    
            // Current town is in existing nation
            if (raw[nationName].name == nationName) 
                raw[nationName].towns?.push(town.name)
    
            if (town.flags.capital) {
                //if (town.wiki) raw[nationName].wiki = town.wiki

                raw[nationName].king = town.mayor
                raw[nationName].capital = {
                    name: town.name,
                    x: town.x,
                    z: town.z
                }
            }
            //#endregion
        }

        return nations as Nation[]
    }
}

export {
    Nations,
    Nations as default
}
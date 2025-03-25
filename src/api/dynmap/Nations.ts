import type { 
    Nation, StrictPoint2D, Town 
} from '../../types/index.js'

import type { Dynmap } from "./Dynmap.js"
import type { EntityApi } from '../../helpers/EntityApi.js'

import { 
    FetchError,
    NotFoundError 
} from "../../utils/errors.js"

import { 
    getNearest
} from '../common.js'

import { 
    sqr, getExisting, 
    fastMergeUnique
} from '../../utils/functions.js'

class Nations implements EntityApi<Nation | NotFoundError> {
    #map: Dynmap
    get map() { return this.#map }

    constructor(map: Dynmap) {
        this.#map = map
    }

    readonly get = async(...nationList: string[]) => {
        const nations = await this.all()
        if (!nations) throw new FetchError('Error fetching nations! Please try again.')
    
        const existing = getExisting(nations, nationList, 'name')
        return existing.length > 1 ? Promise.all(existing): Promise.resolve(existing[0])
    }

    readonly all = async(towns?: Town[]) => {
        if (!towns) {
            towns = await this.map.Towns.all()
            if (!towns) throw new Error('Error getting nations: Could not fetch towns.')
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
            const resNames = raw[nationName].residents

            raw[nationName].residents = fastMergeUnique(resNames, town.residents)    
            raw[nationName].area += town.area
    
            // Current town is in existing nation
            if (raw[nationName].name == nationName) 
                raw[nationName].towns?.push(town.name)
    
            if (town.flags.capital) {
                if (town.wiki) raw[nationName].wiki = town.wiki

                raw[nationName].king = town.mayor
                raw[nationName].capital = {
                    name: town.name,
                    x: town.x,
                    z: town.z
                }
            }
            //#endregion
        }

        return nations
    }

    readonly nearby = async (location: StrictPoint2D, radius: StrictPoint2D, nations?: Nation[]) => 
        getNearest<Nation>(location, radius, nations, this.all)

    readonly joinable = async (townName: string, nationless = true) => {
        const town = await this.map.Towns.get(townName)
            .then(obj => obj instanceof NotFoundError ? null : obj as Town)
            .catch(() => {
                throw new FetchError('Error fetching town ${}! Please try again.')
            })

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
import * as fn from '../../utils/functions.js'

import type Dynmap from "./Dynmap.js"
//import OfficialAPI from "../OAPI.js"

import type { 
    Resident, Town 
} from 'types'

import { 
    FetchError, 
    InvalidError, 
    type NotFoundError 
} from "utils/errors.js"

import type { EntityApi } from 'helpers/EntityApi.js'

class Residents implements EntityApi<Resident | NotFoundError> {
    #map: Dynmap
    get map() { return this.#map }

    constructor(map: Dynmap) {
        this.#map = map
    }

    readonly fromTown = async (townName: string) => {
        if (!townName) throw new InvalidError(`Parameter 'town' is ${townName}`)

        const town = await this.map.Towns.get(townName) as Town
        if (town instanceof Error) throw town

        return await this.get(...town.residents)
    }
    
    /** @internal */
    // private mergeIfAurora = async (res: Resident) => this.map.name === 'aurora' ? { 
    //     ...await OfficialAPI.resident(res.name), 
    //     ...res 
    // } : res

    readonly get = async (...residentList: string[]) => {
        const residents = await this.all()
        if (!residents) throw new FetchError('Error fetching residents! Please try again.')

        const existing = fn.getExisting(residents, residentList, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async (towns?: Town[]) => {
        if (!towns) {
            towns = await this.map.Towns.all()
            if (!towns) return null
        }
    
        return towns.reduce((acc: Resident[], town: Town) => {
            acc.push.apply(acc, town.residents.map(res => ({
                name: res,
                town: town.name,
                nation: town.nation,
                rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
            })))

            return acc
        }, [])
    }
}

export {
    Residents,
    Residents as default
}
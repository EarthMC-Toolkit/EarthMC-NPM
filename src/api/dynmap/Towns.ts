import striptags from 'striptags'
import type Dynmap from "./Dynmap.js"

import {
    formatString, asBool, 
    calcArea, range,
    getExisting,
    isInvitable
} from '../../utils/functions.js'

import { 
    FetchError, 
    InvalidError, 
    NotFoundError 
} from "../../utils/errors.js"

import type { EntityApi } from '../../helpers/EntityApi.js'
import type { Nation, StrictPoint2D, Town } from '../../types'
import { getNearest } from '../common.js'

class Towns implements EntityApi<Town | NotFoundError> {
    #map: Dynmap
    get map() { return this.#map }

    constructor(map: Dynmap) {
        this.#map = map
    }

    readonly fromNation = async(nationName: string) => {
        if (!nationName) throw new InvalidError(`Parameter 'nation' is ${nationName}`)

        const nation = await this.map.Nations.get(nationName) as Nation
        if (nation instanceof Error) throw nation

        return await this.get(...nation.towns)
    }

    /** @internal */
    // private mergeIfAurora = async (town: any) => this.map.name === 'aurora' ? { 
    //     ...await OfficialAPI.town(town.name),
    //     ...town
    // } : town

    readonly get = async(...townList: string[]) => {
        const towns = await this.all()
        if (!towns) throw new FetchError('Error fetching towns! Please try again.')

        const existing = getExisting(towns, townList, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async(removeAccents = false) => {
        let cachedTowns = this.map.getFromCache('towns')
        if (cachedTowns) return cachedTowns as Town[]

        const markerset = await this.map.markerset()
        if (!markerset?.areas) {
            throw new ReferenceError('No areas found on markerset!')
        }

        const townsArray: Town[] = []
        const areas = Object.values(markerset.areas)
              
        const len = areas.length
        for (let i = 0; i < len; i++) {
            const town = areas[i]
            const rawinfo = town.desc.split("<br />")
            const info = rawinfo.map(i => striptags(i, ['a']))

            const firstEl = info[0]
            if (firstEl.includes("(Shop)")) continue

            const mayor = info[1].slice(7)
            if (mayor == "") continue

            let split: string | string[] = firstEl.split(" (")
            split = (split[2] ?? split[1]).slice(0, -1)

            const residents = info[2].slice(9).split(", ")
            const capital = asBool(info[9]?.slice(9))

            let nationName = split
            let wikiPage = null

            // Check if we have a wiki
            if (split.includes('href')) {
                nationName = split.slice(split.indexOf('>') + 1).replace('</a>', '')

                split = split.replace('<a href="', '')
                if (capital) wikiPage = split.substring(0, split.indexOf('"'))
            }

            const home = nationName != "" ? markerset.markers[`${town.label}__home`] : null
            const [townX, townZ] = [town.x, town.z]
            const area = calcArea(townX, townZ, townX.length)

            const currentTown: Town = {
                name: formatString(town.label, removeAccents),
                nation: nationName == "" ? "No Nation" : formatString(nationName.trim(), removeAccents),
                mayor, area,
                x: home?.x ?? range(townX),
                z: home?.z ?? range(townZ),
                bounds: {
                    x: townX.map(num => Math.round(num)),
                    z: townZ.map(num => Math.round(num))
                },
                residents: residents,
                flags: {
                    pvp: asBool(info[4]?.slice(5)),
                    mobs: asBool(info[5]?.slice(6)),
                    public: asBool(info[6]?.slice(8)),
                    explosion: asBool(info[7]?.slice(11)),
                    fire: asBool(info[8]?.slice(6)),
                    capital: capital
                },
                colours: {
                    fill: town.fillcolor,
                    outline: town.color
                },
                opacities: {
                    fill: town.fillopacity,
                    outline: town.opacity
                }
            }

            if (wikiPage)
                currentTown['wiki'] = wikiPage

            townsArray.push(currentTown)
        }

        //#region Remove duplicates & add to area
        const temp: Record<string, Town> = {}
        cachedTowns = []

        const townsArrLen = townsArray.length
        for (let i = 0; i < townsArrLen; i++) {
            const town = townsArray[i]
            const name = town.name
            
            if (temp[name]) temp[name].area += town.area
            else {
                temp[name] = town
                cachedTowns.push(town)
            }
        }
        //#endregion

        if (cachedTowns.length > 0) {
            this.map.putInCache('towns', cachedTowns)
            //this.map.unrefIfNode()
        }

        return cachedTowns as Town[]
    }

    readonly nearby = async (location: StrictPoint2D, radius: StrictPoint2D, towns?: Town[]) => 
        getNearest<Town>(location, radius, towns, this.all)

    readonly invitable = async(nationName: string, includeBelonging = false) => {
        const nation = await this.map.Nations.get(nationName) as Nation
        if (nation instanceof NotFoundError) throw new Error("Error checking invitable: Nation does not exist!")
        if (!nation) throw new Error("Error checking invitable: Could not fetch the nation!")

        const towns = await this.all()
        if (!towns) throw new FetchError('An error occurred fetching towns!')

        return towns.filter(t => isInvitable(t, nation, this.map.inviteRange, includeBelonging))
    }
}

export {
    Towns,
    Towns as default
}
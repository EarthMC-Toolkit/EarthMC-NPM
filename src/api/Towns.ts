import striptags from 'striptags'

import * as fn from '../utils/functions.js'

import { FetchError, InvalidError, NotFoundError } from "../utils/errors.js"
import { Nation, Town } from '../types.js'
import { Map } from "../Map.js"
import { EntityApi } from './EntityApi.js'

class Towns implements EntityApi<Town | NotFoundError> {
    #map: Map

    get map() { return this.#map }

    constructor(map: Map) {
        this.#map = map
    }

    readonly fromNation = async (nationName: string) => {
        if (!nationName) throw new InvalidError(`Parameter 'nation' is ${nationName}`)

        const nation = await this.map.Nations.get(nationName) as Nation
        if (nation instanceof Error) throw nation

        return await this.get(...nation.towns) as Town[]
    }

    /** @internal */
    // private mergeIfAurora = async (town: any) => this.map.name === 'aurora' ? { 
    //     ...await OfficialAPI.town(town.name),
    //     ...town
    // } : town

    readonly get = async (...townList: string[]) => {
        const towns = await this.all()
        if (!towns) throw new FetchError('Error fetching towns! Please try again.')

        const existing = fn.getExisting(towns, townList, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async (removeAccents = false) => {
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
            const capital = fn.asBool(info[9]?.slice(9))

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
            const area = fn.calcArea(townX, townZ, townX.length)

            const currentTown: Town = {
                name: fn.formatString(town.label, removeAccents),
                nation: nationName == "" ? "No Nation" : fn.formatString(nationName.trim(), removeAccents),
                mayor, area,
                x: home?.x ?? fn.range(townX),
                z: home?.z ?? fn.range(townZ),
                bounds: {
                    x: townX.map(num => Math.round(num)),
                    z: townZ.map(num => Math.round(num))
                },
                residents: residents,
                flags: {
                    pvp: fn.asBool(info[4]?.slice(5)),
                    mobs: fn.asBool(info[5]?.slice(6)),
                    public: fn.asBool(info[6]?.slice(8)),
                    explosion: fn.asBool(info[7]?.slice(11)),
                    fire: fn.asBool(info[8]?.slice(6)),
                    capital: capital
                },
                colourCodes: {
                    fill: town.fillcolor,
                    outline: town.color
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
            this.map.unrefIfNode()
        }

        return cachedTowns as Town[]
    }

    readonly nearby = async (
        xInput: number, zInput: number, 
        xRadius: number, zRadius: number, 
        towns?: Town[]
    ) => {
        if (!towns) {
            towns = await this.all()
            if (!towns) return null
        }

        return towns.filter(t => 
            fn.hypot(t.x, [xInput, xRadius]) &&
            fn.hypot(t.z, [zInput, zRadius]))
    }

    readonly invitable = async (nationName: string, includeBelonging = false) => {
        const nation = await this.map.Nations.get(nationName) as Nation
        if (!nation) throw new Error("Could not fetch the nation")

        const towns = await this.all()
        if (!towns) throw new FetchError('An error occurred fetching towns!')

        return towns.filter(t => invitable(t, nation, this.map.inviteRange, includeBelonging))
    }
}

const invitable = (town: Town, nation: Nation, range: number, belonging: boolean) => {
    const sqr = fn.sqr(town, nation.capital, range) && town.nation != nation.name
    return belonging ? sqr : sqr && town.nation == "No Nation"
}

export {
    Towns,
    Towns as default
}
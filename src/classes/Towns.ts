import * as fn from '../utils/functions.js'

import { FetchError, InvalidError } from "../utils/errors.js"
import { Base, Nation, Town } from '../types.js'
import { Map } from "../Map.js"

import OfficialAPI from './OAPI.js'
import striptags from 'striptags'

class Towns implements Base {
    private map: Map

    constructor(map: Map) {
        this.map = map
    }

    readonly fromNation = async (nationName: string) => {
        if (!nationName) return new InvalidError(`Parameter 'nation' is ${nationName}`)

        const nation = await this.map.Nations.get(nationName) as Nation
        if (nation instanceof Error) throw nation

        return await this.get(...nation.towns)
    }

    /** @internal */
    private mergeIfAurora = async (town: Town) => {
        if (this.map.name === 'aurora') {
            return { ...town, ...await OfficialAPI.town(town.name) }
        }

        return town
    }

    readonly get = async (...townList: string[]) => {
        const towns = await this.all()
        if (!towns) throw new FetchError('Error fetching towns! Please try again.')

        const existing = fn.getExisting(towns, townList, 'name')
        const isArr = existing instanceof Array

        return isArr ? 
            Promise.all(existing.map(async t => await this.mergeIfAurora(t))) : 
            Promise.resolve(await this.mergeIfAurora(existing))
    }

    readonly all = async (removeAccents = false) => {
        let cachedTowns = this.map.getFromCache('towns')
        if (cachedTowns) return cachedTowns as Town[]

        const markerset = await this.map.markerset()
        if (!markerset?.areas) {
            throw new ReferenceError('No areas found on markerset!')
        }

        cachedTowns = []

        const townsArray = [], 
              townData = Object.keys(markerset.areas).map(key => markerset.areas[key]), 
              len = townData.length

        for (let i = 0; i < len; i++) {
            const town = townData[i], 
                  rawinfo = town.desc.split("<br />"), 
                  info = rawinfo.map(i => striptags(i, ['a']))

            if (info[0].includes("(Shop)")) continue

            const mayor = info[1].slice(7)
            if (mayor == "") continue

            let split: string | string[] = info[0].split(" (")
            split = (split[2] ?? split[1]).slice(0, -1)

            const residents = info[2].slice(9).split(", "), 
                  capital = fn.asBool(info[9]?.slice(9))

            let nationName = split, 
                wikiPage = null

            // Check if we have a wiki
            if (split.includes('href')) {
                nationName = split.slice(split.indexOf('>') + 1).replace('</a>', '')

                split = split.replace('<a href="', '')
                if (capital) wikiPage = split.substring(0, split.indexOf('"'))
            }

            const home = nationName != "" ? markerset.markers[`${town.label}__home`] : null
            const currentTown: Town = {
                name: fn.formatString(town.label, removeAccents),
                nation: nationName == "" ? "No Nation" : fn.formatString(nationName.trim(), removeAccents),
                mayor: mayor,
                area: fn.calcArea(town.x, town.z, town.x.length),
                x: home?.x ?? fn.range(town.x),
                z: home?.z ?? fn.range(town.z),
                bounds: {
                    x: town.x.map(num => Math.round(num)),
                    z: town.z.map(num => Math.round(num))
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

        const temp: Record<string, Town> = {}

        //#region Remove duplicates & add to area
        townsArray.forEach(a => {
            const name = a.name
        
            if (temp[name]) temp[name].area += a.area
            else {    
                temp[name] = a
                cachedTowns.push(temp[name])
            }
        }, {})
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
        if (!nation || nation instanceof Error) throw new Error()

        const towns = await this.all()
        if (!towns) return new FetchError('Error fetching towns! Please try again.')

        const invitable = (town: Town) => {
            const sqr = fn.sqr(town, nation.capital, this.map.inviteRange) && town.nation != nation.name
            return includeBelonging ? sqr : sqr && town.nation == "No Nation"
        }

        return towns.filter(t => invitable(t))
    }
}

export {
    Towns,
    Towns as default
}
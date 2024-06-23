import striptags from 'striptags'
import type Dynmap from './Dynmap.js'

import type { 
    MapResponse, 
    OnlinePlayer, Player, 
    StrictPoint2D
} from 'types'

import * as fn from 'utils/functions.js'
import * as endpoint from 'utils/endpoint.js'
import { FetchError, type NotFoundError } from "utils/errors.js"
import type { EntityApi } from 'helpers/EntityApi.js'
import { getNearest } from '../common.js'

class Players implements EntityApi<Player | NotFoundError> {
    #map: Dynmap
    get map() { return this.#map }

    constructor(map: Dynmap) {
        this.#map = map
    }

    readonly get = async(...playerList: string[]) => {
        const players = await this.all()
        if (!players) throw new FetchError('Error fetching players! Please try again.')
        
        const existing = fn.getExisting(players, playerList, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async() => {
        const onlinePlayers = await this.map.onlinePlayerData()
        if (!onlinePlayers) return

        const residents = await this.map.Residents.all()
        if (!residents) return
    
        // Loop over residents and merge data for any online players
        const merged = residents.map(res => {
            const op = onlinePlayers.find(op => op.name === res.name)
            return !op ? { ...res, online: false } : { ...res, ...op, online: true }
        })

        return merged as Player[]
    }
    
    readonly townless = async() => {
        const onlinePlayers = await this.online()
        if (!onlinePlayers) return null

        const mapData = await endpoint.mapData<MapResponse>("aurora")
        if (!mapData) throw new FetchError('Error fetching townless! Please try again.')

        const allResidents: string[] = []
        const markerset = mapData.sets["townyPlugin.markerset"]
        const areas = Object.values(markerset.areas)
        
        const len = areas.length
        for (let i = 0; i < len; i++) {
            const town = areas[i]
            const rawinfo = town.desc.split("<br />")
            const info = rawinfo.map(x => striptags(x))

            if (info[0].endsWith("(Shop)")) continue

            const mayor = info[1].slice(7)
            if (mayor == "") continue
            
            const residents = info[2].slice(9).split(", ")
            allResidents.push(...residents)
        }

        // Filter out residents & sort alphabetically
        const residentSet = new Set(allResidents)
        return onlinePlayers.filter(op => !residentSet.has(op.name)).sort((a, b) => {
            const [aName, bName] = [a.name.toLowerCase(), b.name.toLowerCase()]
            return bName < aName ? 1 : bName > aName ? -1 : 0
        })
    }

    readonly online = async(includeResidentInfo = false) => {
        const onlinePlayers = await this.map.onlinePlayerData()
        if (!onlinePlayers) return null
        if (!includeResidentInfo) return onlinePlayers

        const residents = await this.map.Residents.all()
        if (!residents) return null

        const merged: Player[] = []
        const len = onlinePlayers.length

        for (let i = 0; i < len; i++) {
            const curOp = onlinePlayers[i]
            const foundRes = residents.find(res => res.name === curOp.name)

            merged.push({ ...curOp, ...foundRes })
        }
    
        return merged
    }

    readonly nearby = async (location: StrictPoint2D, radius: StrictPoint2D, players?: OnlinePlayer[]) => 
        getNearest<OnlinePlayer>(location, radius, players, this.all, true)
}

export {
    Players,
    Players as default
}
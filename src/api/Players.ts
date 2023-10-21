import striptags from 'striptags'

import * as fn from '../utils/functions.js'
import * as endpoint from '../utils/endpoint.js'
import { FetchError } from "../utils/errors.js"
      
import { Map } from '../Map.js'
import { OnlinePlayer, Player } from '../types.js'
import { EntityApi } from './EntityApi.js'

class Players implements EntityApi<Player> {
    #map: Map

    get map() { return this.#map }

    constructor(map: Map) {
        this.#map = map
    }

    readonly get = async (...playerList: string[]) => {
        const players = await this.all()
        if (!players) throw new FetchError('Error fetching players! Please try again.')
        
        return fn.getExisting(players, playerList, 'name') as Player | Player[]
    }

    readonly all = async () => {
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
    
    readonly townless = async () => {
        const mapData = await endpoint.mapData("aurora")
        if (!mapData) throw new FetchError('Error fetching townless! Please try again.')
    
        const onlinePlayers = await this.online()
        if (!onlinePlayers) return null

        const allResidents: string[] = [],
              markerset = mapData.sets["townyPlugin.markerset"],
              areas = Object.values(markerset.areas)
        
        const len = areas.length
        for (let i = 0; i < len; i++) {
            const town = areas[i],
                  rawinfo = town.desc.split("<br />"),
                  info = rawinfo.map(x => striptags(x))

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

    readonly online = async (includeResidentInfo = false) => {
        const onlinePlayers = await this.map.onlinePlayerData()
        if (!onlinePlayers) return null
        if (!includeResidentInfo) return onlinePlayers

        const residents = await this.map.Residents.all()
        if (!residents) return null

        const merged = [], 
              len = onlinePlayers.length

        for (let i = 0; i < len; i++) {
            const curOp = onlinePlayers[i],
                  foundRes = residents.find(res => res.name === curOp.name)

            merged.push({ ...curOp, ...foundRes })
        }
    
        return merged as Player[]
    }

    readonly nearby = async (xInput: number, zInput: number, xRadius: number, zRadius: number, players?: OnlinePlayer[]) => {
        if (!players) {
            players = await this.all()
            if (!players) return null
        }

        return players.filter(p => {            
            if (p.x == 0 && p.z == 0) return
            return fn.hypot(fn.safeParseInt(p.x), [xInput, xRadius]) && 
                   fn.hypot(fn.safeParseInt(p.z), [zInput, zRadius])
        })
    }
}

export {
    Players,
    Players as default
}
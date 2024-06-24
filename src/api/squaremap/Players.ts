import striptags from "striptags"
import type Squaremap from "./Squaremap.js"

import type {
    EntityApi
} from "../../helpers/EntityApi.js"

import type { OnlinePlayer, Player, StrictPoint2D } from "../../types"
import { FetchError, type NotFoundError } from "../../utils/errors.js"
import { getExisting } from "../../utils/functions.js"
import { parseInfoString } from "./parser.js"
import { getNearest } from "../common.js"

class Players implements EntityApi<Player | NotFoundError> {
    #map: Squaremap
    get map() { return this.#map }
    
    constructor(map: Squaremap) {
        this.#map = map
    }

    readonly get = async(...names: string[]) => {
        const players = await this.all()
        if (!players) throw new FetchError('Error fetching players! Please try again.')
        
        const existing = getExisting(players, names, 'name')
        return existing.length > 1 ? Promise.all(existing) : Promise.resolve(existing[0])
    }

    readonly all = async() => {
        const onlinePlayers = await this.map.onlinePlayerData()
        if (!onlinePlayers) throw new Error('Error getting all players: Something went wrong getting online players?')

        const residents = await this.map.Residents.all()
        if (!residents) throw new Error('Error getting all players: Something went wrong getting residents?')
    
        // Loop over residents and merge data for any online players
        const merged = residents.map(res => {
            const op = onlinePlayers.find(op => op.name === res.name)
            return (!op ? { ...res, online: false } : { ...res, ...op, online: true }) as Player
        })

        return merged
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

    readonly townless = async() => {
        const onlinePlayers = await this.online()
        if (!onlinePlayers) return null

        const markerset = await this.map.markerset()
        if (!markerset) throw new FetchError('Error fetching townless! Please try again.')

        const allResidents: string[] = []

        const len = markerset.markers.length
        for (let i = 0; i < len; i++) {
            const curMarker = markerset.markers[i]
            if (curMarker.type == "icon") continue
    
            const rawInfo = curMarker.popup.replaceAll('\n', '')
            const info = striptags(rawInfo, ['a']).split("        ") // TODO: Probably not reliable, replace with trim ?
    
            const residents = parseInfoString(info[4]).split(", ")
            allResidents.push(...residents)
        }

        // Filter out residents & sort alphabetically
        const residentSet = new Set(allResidents)
        return onlinePlayers.filter(op => !residentSet.has(op.name)).sort((a, b) => {
            const [aName, bName] = [a.name.toLowerCase(), b.name.toLowerCase()]
            return bName < aName ? 1 : bName > aName ? -1 : 0
        })
    }

    readonly nearby = async(location: StrictPoint2D, radius: StrictPoint2D, players?: OnlinePlayer[]) => 
        getNearest<OnlinePlayer>(location, radius, players, this.all, true)
}

export {
    Players,
    Players as default
}
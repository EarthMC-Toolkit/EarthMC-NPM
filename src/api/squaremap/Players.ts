import type Squaremap from "./Squaremap.js"

import type {
    EntityApi
} from "../../helpers/EntityApi.js"

import type { 
    SquaremapOnlinePlayer, SquaremapPlayer, 
    StrictPoint2D 
} from "../../types/index.js"

import { FetchError, type NotFoundError } from "../../utils/errors.js"
import { getExisting } from "../../utils/functions.js"
import { parsePopup } from "./parser.js"
import { getNearest } from "../common.js"

class Players implements EntityApi<SquaremapPlayer | NotFoundError> {
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
        const merged: SquaremapPlayer[] = residents.map(res => {
            const op = onlinePlayers.find(op => op.name === res.name)
            return (!op ? { ...res, online: false } : { ...res, ...op, online: true })
        })

        return merged
    }

    readonly online = async(includeResidentInfo = false) => {
        const onlinePlayers = await this.map.onlinePlayerData()
        if (!onlinePlayers) return null // TODO: Should probably throw a proper err
        if (!includeResidentInfo) return onlinePlayers

        const residents = await this.map.Residents.all()
        if (!residents) return onlinePlayers

        const merged: SquaremapPlayer[] = []
        const opsLen = onlinePlayers.length

        for (let i = 0; i < opsLen; i++) {
            const curOp = onlinePlayers[i]
            const foundRes = residents.find(res => res.name === curOp.name)

            merged.push({ online: true, ...curOp, ...foundRes })
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
    
            const parsedPopup = parsePopup(curMarker.popup)
            allResidents.push.apply(allResidents, parsedPopup.residents)
        }

        // Remove duplicates
        const residentSet = new Set(allResidents)

        // Filter out residents & sort alphabetically
        return onlinePlayers.filter(op => !residentSet.has(op.name)).sort((a, b) => {
            const [aName, bName] = [a.name.toLowerCase(), b.name.toLowerCase()]
            return bName < aName ? 1 : bName > aName ? -1 : 0
        })
    }

    readonly nearby = async(location: StrictPoint2D, radius: StrictPoint2D, players?: SquaremapOnlinePlayer[]) => 
        getNearest<Partial<SquaremapPlayer>>(location, radius, players, this.online, true)
}

export {
    Players,
    Players as default
}
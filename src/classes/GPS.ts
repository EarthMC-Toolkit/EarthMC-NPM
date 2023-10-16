import * as fn from '../utils/functions.js'
import { Map } from '../Map.js'

import { 
    Route, Routes,
    Location,
    Nation,
    RouteInfo,
    Player
} from '../types.js'

import Mitt from './EventEmitter.js'

const NativeMap = globalThis.Map

class GPS extends Mitt {
    readonly map: Map
    static readonly Routes = Routes
    private emittedUnderground = false
    private lastLoc: undefined | {
        x: number
        z: number
    }

    constructor(map: Map) {
        super()
        this.map = map
    }

    readonly getPlayer = async (name: string) => {
        const player = await this.map.Players.get(name)
        return player
    }

    readonly playerIsOnline = (player: Player) => {
        if (!player.online)
            this.emit('error', { err: "INVALID_PLAYER", msg: "Player is offline or does not exist!" })

        return player.online
    }

    readonly track = async(playerName: string, interval = 3000, route = Routes.FASTEST) => {
        setInterval(async () => {
            const player = await this.getPlayer(playerName).catch(e => {
                this.emit('error', { err: "FETCH_ERROR", msg: e.message })
                return null
            }) as Player

            if (!player) return
            if (!(this.playerIsOnline(player))) return

            if (player.underground) {
                if (!this.emittedUnderground) {
                    this.emittedUnderground = true

                    if (!this.lastLoc) {
                        this.emit("underground", "No last location. Waiting for this player to show.")
                        return
                    }
                    
                    try {
                        const routeInfo = await this.findRoute(this.lastLoc, route)
                        this.emit('underground', { 
                            lastLocation: this.lastLoc, 
                            routeInfo: routeInfo
                        })
                    } catch(e: any) {
                        this.emit('error', { err: "INVALID_LAST_LOC", msg: e.message })
                    }
                }
            } 
            else {
                this.lastLoc = { x: player.x, z: player.z }

                try {
                    const routeInfo = await this.findRoute({
                        x: player.x,
                        z: player.z
                    }, route)
        
                    this.emit('locationUpdate', routeInfo)
                } catch(e: any) {
                    this.emit('error', { err: "INVALID_LOC", msg: e.message })
                }
            }
        }, interval)

        return this
    }

    readonly safestRoute = (loc: Location) => this.findRoute(loc, Routes.SAFEST)
    readonly fastestRoute = (loc: Location) => this.findRoute(loc, Routes.FASTEST)

    readonly findRoute = async (loc: Location, options: Route) => {
        if (fn.strictFalsy(loc.x) || fn.strictFalsy(loc.z)) {
            const obj = JSON.stringify(loc)
            throw new Error(`Cannot calculate route! One or more inputs are invalid:\n${obj}`)
        }

        // Scan all nations for closest match.
        // Computationally more expensive to include PVP disabled nations.
        const [towns, nations] = await Promise.all([this.map.Towns.all(), this.map.Nations.all()])
        const townMap = new NativeMap(towns.map(town => [town.name, town]))

        const len = nations.length
        const filtered = []

        for (let i = 0; i < len; i++) {
            const nation = nations[i]
            const capitalName = nation.capital.name

            const capital = townMap.get(capitalName)
            if (!capital) continue

            // Filter out nations where either capital is not public 
            // or both avoidPvp and flags.pvp are true
            const flags = capital.flags

            const PVP = options.avoidPvp && flags.pvp
            const PUBLIC = options.avoidPublic && !flags.public
            if (PVP || PUBLIC) continue

            filtered.push(nation)
        }

        // Use reduce to find the minimum distance and corresponding nation
        const { distance, nation } = filtered.reduce((acc: any, nation: Nation) => {
            const capital = nation.capital
            const dist = fn.manhattan(capital.x, capital.z, loc.x, loc.z)

            // Update acc if this nation is closer
            const closer = !acc.distance || dist < acc.distance
            return !closer ? acc : { 
                distance: Math.round(dist), 
                nation: {
                    name: nation.name,
                    capital: capital
                }
            }
        }, { distance: null, nation: null })

        const direction = GPS.cardinalDirection(nation.capital, loc)
        return { nation, distance, direction } as RouteInfo
    }

    static cardinalDirection(loc1: Location, loc2: Location) {
        // Calculate the differences in x and z coordinates
        const deltaX = loc2.x - loc1.x
        const deltaZ = loc2.z - loc1.z

        const angleRad = Math.atan2(deltaZ, deltaX) // Calculate the angle in radians
        const angleDeg = (angleRad * 180) / Math.PI // Convert the angle from radians to degrees

        // Determine the cardinal direction
        if (angleDeg >= -45 && angleDeg < 45) 
            return "east"
        
        if (angleDeg >= 45 && angleDeg < 135) 
            return "north"
        
        if (angleDeg >= 135 || angleDeg < -135) 
            return "west"
        
        return "south"
    }
}

export {
    GPS, GPS as default
}
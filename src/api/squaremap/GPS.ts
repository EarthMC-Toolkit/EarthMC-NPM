import { Routes } from '../../types/index.js'
import type { 
    Route, RouteInfo,
    Point2D, SquaremapNation, SquaremapPlayer,
    StrictPoint2D
} from '../../types/index.js'

import Emitter from '../../helpers/EventEmitter.js'
import { manhattan, safeParseInt, strictFalsy } from '../../utils/functions.js'

import type Squaremap from './Squaremap.js'

type GPSEvents = {
    error: {
        err: string
        msg: string
    }
    underground: string | {
        lastLocation: StrictPoint2D, 
        routeInfo: RouteInfo
    }
    locationUpdate: RouteInfo
}

class GPS extends Emitter<GPSEvents> {
    #map: Squaremap
    #emittedUnderground = false
    #lastLoc: undefined | {
        x: number
        z: number
    }

    get map() { return this.#map }

    get emittedUnderground() { return this.#emittedUnderground }
    protected set emittedUnderground(val: boolean) {
        this.#emittedUnderground = val
    }

    get lastLoc() { return this.#lastLoc }
    protected set lastLoc(val: { x: number, z: number }) {
        this.#lastLoc = val
    }

    static readonly Routes = Routes

    constructor(map: Squaremap) {
        super()
        this.#map = map
    }

    playerIsOnline(player: SquaremapPlayer) {
        if (!player.online) this.emit('error', { 
            err: "INVALID_PLAYER", 
            msg: "Player is offline or does not exist!" 
        })

        return player.online
    }

    async track(playerName: string, interval = 3000, route = Routes.FASTEST) {
        setInterval(async () => {
            const player: SquaremapPlayer = await this.map.Players.get(playerName).catch(e => {
                this.emit('error', { err: "FETCH_ERROR", msg: e.message })
                return null 
            })

            if (!player) return
            if (!this.playerIsOnline(player)) return

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
                this.lastLoc = { 
                    x: safeParseInt(player.x), 
                    z: safeParseInt(player.z) 
                }

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

    async safestRoute(loc: Point2D) {
        return this.findRoute(loc, Routes.SAFEST)
    }

    async fastestRoute(loc: Point2D) {
        return this.findRoute(loc, Routes.FASTEST)
    }

    async findRoute(loc: Point2D, options: Route = Routes.SAFEST) {
        if (strictFalsy(loc.x) || strictFalsy(loc.z)) {
            const obj = JSON.stringify(loc)
            throw new Error(`Cannot calculate route! One or more inputs are invalid:\n${obj}`)
        }

        // Scan all nations for closest match.
        // Computationally more expensive to include PVP disabled nations.
        const [towns, nations] = await Promise.all([this.map.Towns.all(), this.map.Nations.all()])
        const townsMap = new Map(towns.map(t => [t.name, t]))

        const len = nations.length
        const filtered = []

        for (let i = 0; i < len; i++) {
            const nation = nations[i]
            const capitalName = nation.capital?.name

            if (!capitalName) {
                console.warn(`[GPS.findRoute] Could not scan nation '${nation.name}'. Capital is null/undefined!`)
                continue
            }

            const capital = townsMap.get(capitalName)
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
        const { distance, nation } = filtered.reduce((acc: RouteInfo, nation: SquaremapNation) => {
            const dist = manhattan(
                safeParseInt(nation.capital.x), safeParseInt(nation.capital.z), 
                safeParseInt(loc.x), safeParseInt(loc.z)
            )

            // Update acc if this nation is closer
            const closer = !acc.distance || dist < acc.distance
            return !closer ? acc : { 
                distance: Math.round(dist), 
                nation: {
                    name: nation.name,
                    capital: nation.capital
                }
            }
        }, { distance: null, nation: null })

        const direction = GPS.cardinalDirection(nation.capital, loc)
        return { nation, distance, direction } as RouteInfo
    }

    /**
     * Determines the direction to the destination from the origin.
     * 
     * Only one of the main four directions (N, S, W, E) can be returned, no intermediates.
     * @param origin The location where something is currently at.
     * @param destination The location we wish to arrive at.
     */
    static cardinalDirection(origin: Point2D, destination: Point2D) {
        // Calculate the differences in x and z coordinates
        const deltaX = safeParseInt(origin.x) - safeParseInt(destination.x)
        const deltaZ = safeParseInt(origin.z) - safeParseInt(destination.z)

        // Calculates radians with atan2, then converted to degrees.
        const angle = Math.atan2(deltaZ, deltaX) * 180 / Math.PI
 
        // Determine the cardinal direction
        if (angle >= -45 && angle < 45) return "east"
        if (angle >= 45 && angle < 135) return "north"
        if (angle >= 135 || angle < -135) return "west"

        return "south"
    }
}

export {
    GPS, GPS as default
}
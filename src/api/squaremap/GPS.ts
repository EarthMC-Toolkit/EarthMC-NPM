import { Routes } from '../../types/index.js'
import type { 
    Route, RouteInfo,
    Point2D, SquaremapNation, SquaremapPlayer,
    StrictPoint2D,
    CardinalDirection,
    TravelTimes
} from '../../types/index.js'

import { 
    DIRECTIONS,
    BASE_DIRECTIONS
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

//#region Speed of different actions (blocks per sec)
const SNEAK_SPEED = 1.295
const WALK_SPEED = 4.317
const SPRINT_SPEED = 5.612
const BOAT_SPEED = 8.0
//#endregion

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
        const travelTimes = GPS.calcTravelTimes(distance)

        return { nation, distance, direction, travelTimes } as RouteInfo
    }

    /**
     * Determines the direction to the destination from the origin.
     * 
     * By default, all 8 directions are allowed, including intermediates such as `North-East`.
     * To turn this off and only allow the 4 basic cardinal directions (`North`, `East`, `South`, `West`),
     * you must pass `false` as the `allowIntermediates` argument.
     * @param origin The location where something is currently at.
     * @param destination The location we wish to arrive at.
     */
    static cardinalDirection(origin: Point2D, destination: Point2D, allowIntermediates = true): CardinalDirection {
        // Calculate the differences in x and z coordinates.
        const deltaX = safeParseInt(destination.x) - safeParseInt(origin.x)
        const deltaZ = safeParseInt(destination.z) - safeParseInt(origin.z)

        // Calc angle of the point in rads, convert to degrees.
        const angle = Math.atan2(deltaZ, deltaX) * 180 / Math.PI
        const normalized = (angle + 90 + 360) % 360 // Normalize from [-180, 180] to [0, 360].

        // To get the correct direction from the array, we calculate the index
        // by dividing the angle by 45 and mod by amt of directions.
        return allowIntermediates ? 
            DIRECTIONS[Math.round(normalized / 45) % 8] :
            BASE_DIRECTIONS[Math.round(normalized / 90) % 4]
    }

    /**
     * Calculates the travel times (sec) for sneaking, walking, sprinting, and boating. Any decimals are truncated.\
     * If the input distance is negative, all of the times will be 0.
     * @param distance The amount of blocks to travel.
     */
    static calcTravelTimes(distance: number): TravelTimes {
        return distance > 0 ? {
            sneaking: ~~(distance / SNEAK_SPEED),
            walking: ~~(distance / WALK_SPEED),
            sprinting: ~~(distance / SPRINT_SPEED),
            boat: ~~(distance / BOAT_SPEED)
        } : {
            sneaking: 0,
            walking: 0,
            sprinting: 0,
            boat: 0
        }
    }
}

export {
    GPS, GPS as default
}
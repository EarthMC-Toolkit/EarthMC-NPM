import DataHandler from './helpers/DataHandler.js'

import Towns from './classes/Towns.js'
import Nations from './classes/Nations.js'
import Players from './classes/Players.js'
import Residents from './classes/Residents.js'
import GPS from './classes/GPS.js'

import * as fn from './utils/functions.js'
import { Point2D, TownBounds, ValidMapName } from './types.js'

class Map extends DataHandler {
    //#region Data classes
    readonly Towns: Towns

    readonly Nations: Nations

    readonly Residents: Residents

    readonly Players: Players

    readonly GPS: GPS
    //#endregion

    //#region Map-specific properties
    readonly name: ValidMapName

    readonly inviteRange: number
    //#endregion

    constructor(mapName: ValidMapName) {
        super(mapName)

        this.name = mapName
        this.inviteRange = mapName == 'nova' ? 3000 : 3500

        this.Towns = new Towns(this)
        this.Nations = new Nations(this)
        this.Residents = new Residents(this)
        this.Players = new Players(this)

        this.GPS = new GPS(this)
    }

    readonly withinTown = async (location: Point2D) => {
        const towns = await this.Towns.all()
        const len = towns.length
        
        let inBounds = false
        for (let i = 0; i < len; i++) {
            const cur = towns[i]

            if (this.withinBounds(location, cur.bounds)) {
                inBounds = true
                break
            }
        }

        return inBounds
    }

    readonly isWilderness = async (location: Point2D) => {
        return !(await this.withinTown(location))
    }

    readonly withinBounds = (location: Point2D, bounds: TownBounds) => {
        if (fn.strictFalsy(location.x) || fn.strictFalsy(location.z)) {
            const obj = JSON.stringify(location)
            throw new ReferenceError(`(withinBounds) - Invalid location:\n${obj}`)
        }

        const xLoc = parseInt(String(location.x))
        const zLoc = parseInt(String(location.z))

        // Check if the given coordinates are within the bounds or on the bounds
        const withinX = xLoc >= Math.min(...bounds.x) && xLoc <= Math.max(...bounds.x)
        const withinZ = zLoc >= Math.min(...bounds.z) && zLoc <= Math.max(...bounds.z)

        return withinX && withinZ
    }
}

export {
    Map,
    Map as default
}

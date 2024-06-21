import DataHandler from './helpers/DataHandler.js'

import Towns from './api/dynmap/Towns.js'
import Nations from './api/dynmap/Nations.js'
import Players from './api/dynmap/Players.js'
import Residents from './api/dynmap/Residents.js'
import GPS from './api/dynmap/GPS.js'

import * as fn from './utils/functions.js'
import { MapResponse, PlayersResponse, Point2D, TownBounds, ValidMapName } from './types.js'

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

    readonly isWilderness = async (location: Point2D) => !(await this.withinTown(location))

    readonly withinBounds = (location: Point2D, bounds: TownBounds) => {
        if (fn.strictFalsy(location.x) || fn.strictFalsy(location.z)) {
            const obj = JSON.stringify(location)
            throw new ReferenceError(`(withinBounds) - Invalid location:\n${obj}`)
        }

        const locX = fn.safeParseInt(location.x)
        const locZ = fn.safeParseInt(location.z)

        // Check if the given coordinates are within the bounds or on the bounds
        const withinX = locX >= Math.min(...bounds.x) && locX <= Math.max(...bounds.x)
        const withinZ = locZ >= Math.min(...bounds.z) && locZ <= Math.max(...bounds.z)

        return withinX && withinZ
    }

    readonly onlinePlayerData = async () => {
        const pData = await this.playerData<PlayersResponse>()
        return pData?.players ? fn.editPlayerProps(pData.players) : null
    }

    readonly markerset = async () => {
        const mapData = await this.mapData<MapResponse>()
        return mapData?.sets["townyPlugin.markerset"]
    }
}

export {
    Map,
    Map as default
}

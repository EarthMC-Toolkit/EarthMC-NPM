import type { 
    MapResponse, PlayersResponse, 
    Point2D, TownBounds,
    DynmapMap
} from '../../types/index.js'

import DataHandler from '../../helpers/DataHandler.js'

import Towns from './Towns.js'
import Nations from './Nations.js'
import Players from './Players.js'
import Residents from './Residents.js'
import GPS from './GPS.js'

import { 
    editPlayerProps
} from '../../utils/functions.js'

import { withinBounds, withinTown } from '../common.js'

class Dynmap extends DataHandler {
    //#region Data classes
    readonly Towns: Towns
    readonly Nations: Nations
    readonly Residents: Residents
    readonly Players: Players
    readonly GPS: GPS
    //#endregion

    //#region Map-specific properties
    readonly name: DynmapMap
    readonly inviteRange: number
    //#endregion

    constructor(mapName: DynmapMap, cacheTimeoutMs = 120 * 1000) {
        super(mapName, cacheTimeoutMs)

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
        return withinTown(location, towns)
    }

    readonly isWilderness = async(location: Point2D) => !(await this.withinTown(location))
    readonly withinBounds = (location: Point2D, bounds: TownBounds) => withinBounds(location, bounds)

    readonly onlinePlayerData = async() => {
        const pData = await this.playerData<PlayersResponse>()
        return pData?.players ? editPlayerProps(pData.players) : null
    }

    readonly markerset = async() => {
        const mapData = await this.mapData<MapResponse>()
        return mapData?.sets["townyPlugin.markerset"]
    }
}

export {
    Dynmap,
    Dynmap as default
}

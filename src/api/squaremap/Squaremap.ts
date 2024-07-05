import type { 
    Point2D,
    SquaremapMap,
    SquaremapMapResponse, 
    SquaremapPlayersResponse,
    TownBounds
} from "../../types/index.js"

import DataHandler from "../../helpers/DataHandler.js"

import Towns from './Towns.js'
import Nations from './Nations.js'
import Players from "./Players.js"
import Residents from "./Residents.js"
import GPS from "./GPS.js"

import { parsePlayers } from "./parser.js"
import { withinBounds, withinTown } from "../common.js"

class Squaremap extends DataHandler {
    //#region Data classes
    readonly Towns: Towns
    readonly Nations: Nations
    readonly Residents: Residents
    readonly Players: Players
    readonly GPS: GPS
    //#endregion

    //#region Map-specific properties
    readonly name: SquaremapMap
    readonly inviteRange: number = 3500
    //#endregion

    constructor(mapName: SquaremapMap, cacheTTL = 30) {
        super(mapName, cacheTTL)
        
        this.name = mapName

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
        const res = await this.playerData<SquaremapPlayersResponse>()
        return parsePlayers(res.players)
    }

    readonly markerset = async() => {
        const res = await this.mapData<SquaremapMapResponse>()
        return res.find(x => x.id == "towny")
    }

    // TODO: Convert to builder
    readonly buildMapLink = (location?: Point2D, zoom?: number): URL => {
        const url = new URL(`https://map.earthmc.net/?mapname=flat`)
        if (zoom) url.searchParams.append("zoom", zoom.toString())

        if (location?.x) url.searchParams.append("x", location.x.toString())
        if (location?.z) url.searchParams.append("z", location.z.toString())

        return url
    }
}

export {
    Squaremap,
    Squaremap as default
}
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
import { checkWithinBounds, checkWithinTown } from "../common.js"

import { FetchError, safeParseInt } from "../../main.js"

export class SquaremapURLBuilder {
    #url: URL = new URL(`https://map.earthmc.net/?mapname=flat`)

    constructor(location?: Point2D, zoom?: number) {
        if (location?.x) this.setX(location.x)
        if (location?.z) this.setZ(location.z)
        if (zoom) this.setZoom(zoom)
    }

    #setCoord(str: 'x' | 'z', val: number) {
        return this.#url.searchParams.set(str, val.toString())
    }

    setX(num: number | string) {
        this.#setCoord("x", safeParseInt(num))
        return this
    }

    setZ(num: number | string) {
        this.#setCoord("z", safeParseInt(num))
        return this
    }
    
    setZoom(zoom: number) {
        if (zoom < 0) zoom = 0

        this.#url.searchParams.set("zoom", zoom.toString())
        return this
    }

    // Currently always overworld. This is here purely for future proofing.
    setWorld(name = 'minecraft_overworld') {
        this.#url.searchParams.set("world", name)
        return this
    }

    get = () => this.#url
    getAsString = () => this.#url.toString()
}

class Squaremap extends DataHandler {
    //#region Data classes
    readonly Towns: Towns
    readonly Nations: Nations
    readonly Residents: Residents
    readonly Players: Players
    readonly GPS: GPS

    URLBuilder = SquaremapURLBuilder
    //#endregion

    //#region Map-specific properties
    readonly name: SquaremapMap
    readonly inviteRange: number = 3500
    //#endregion

    constructor(mapName: SquaremapMap, cacheTimeoutMs = 5000) {
        super(mapName, cacheTimeoutMs)
        
        this.name = mapName

        this.Towns = new Towns(this)
        this.Nations = new Nations(this)
        this.Residents = new Residents(this)
        this.Players = new Players(this)

        this.GPS = new GPS(this)
    }
    
    readonly withinTown = async (location: Point2D) => {
        const towns = await this.Towns.all()
        return checkWithinTown(location, towns)
    }

    readonly isWilderness = async (location: Point2D) => !(await this.withinTown(location))
    readonly withinBounds = (location: Point2D, bounds: TownBounds) => checkWithinBounds(location, bounds)

    readonly onlinePlayerData = async () => {
        const res = await this.playerData<SquaremapPlayersResponse>()
        if (!res) throw new FetchError('Error fetching online players!')

        return parsePlayers(res.players)
    }

    readonly markerset = async () => {
        const res = await this.mapData<SquaremapMapResponse>()
        return res.find(x => x.id == "towny")
    }
}

export {
    Squaremap,
    Squaremap as default
}
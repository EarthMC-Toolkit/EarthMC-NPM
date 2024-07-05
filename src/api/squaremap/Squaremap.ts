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

    URLBuilder = class {
        #url: URL = new URL(`https://map.earthmc.net/?mapname=flat`)
    
        constructor(location?: Point2D) {
            if (location?.x) this.#setCoord("x", Number(location.x))
            if (location?.z) this.#setCoord("z", Number(location.z))
        }
    
        #setCoord = (str: 'x' | 'z', val: number) => this.#url.searchParams.set(str, val.toString())
    
        setX = (num: number) => this.#setCoord("x", num)
        setZ = (num: number) => this.#setCoord("z", num)
    
        setZoom(zoom: number) {
            this.#url.searchParams.set("zoom", zoom.toString())
        }
    
        // Currently always overworld. This is here purely for future proofing.
        setWorld = (name = 'minecraft_overworld') => {
            this.#url.searchParams.set("world", name)
        }
    
        get = () => this.#url
        getAsString = () => this.#url.toString()
    }
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

    /**
     * @deprecated May be removed in future. Prefer {@link URLBuilder} instead. 
     */
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
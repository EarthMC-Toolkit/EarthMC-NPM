import type { 
    Point2D,
    SquaremapMapResponse, 
    ValidMapName
} from "types"

import DataHandler from "helpers/DataHandler.js"

import Towns from './Towns.js'
import Nations from './Nations.js'
import Players from "./Players.js"
import Residents from "./Residents.js"

class Squaremap extends DataHandler {
    //#region Data classes
    readonly Towns: Towns
    readonly Nations: Nations
    readonly Residents: Residents
    readonly Players: Players
    // readonly GPS: GPS
    //#endregion

    //#region Map-specific properties
    readonly name: ValidMapName
    readonly inviteRange: number = 3500
    //#endregion

    constructor(mapName: ValidMapName) {
        super(mapName)
        
        this.name = mapName

        this.Towns = new Towns(this)
        this.Nations = new Nations(this)
        this.Residents = new Residents(this)
        this.Players = new Players(this)

        // this.GPS = new GPS(this)
    }

    markerset = async () => {
        const res = await this.mapData<SquaremapMapResponse>()
        return res.find(x => x.id == "towny")
    }

    buildMapLink = (zoom?: number, location?: Point2D): URL => {
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
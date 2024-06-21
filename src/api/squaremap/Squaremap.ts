import { SquaremapMapResponse, ValidMapName } from "src/types.js"
import DataHandler from "../../helpers/DataHandler.js"

import Towns from '../squaremap/Towns.js'

class Squaremap extends DataHandler {
    //#region Data classes
    readonly Towns: Towns
    // readonly Nations: Nations
    // readonly Residents: Residents
    // readonly Players: Players
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
        // this.Nations = new Nations(this)
        // this.Residents = new Residents(this)
        // this.Players = new Players(this)

        // this.GPS = new GPS(this)
    }

    markerset = async () => {
        const res = await this.mapData<SquaremapMapResponse>()
        return res.find(x => x.id == "towny")
    }
}

export {
    Squaremap,
    Squaremap as default
}
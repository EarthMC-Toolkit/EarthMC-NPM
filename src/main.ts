import OfficialAPI from './classes/OAPI.js'

import { MCAPI } from "mojang-lib"
import { Map } from './Map.js'

import * as endpoint from './utils/endpoint.js'
import * as Errors from "./utils/errors.js"

async function getServerData() {
    const serverData = await MCAPI.servers.get("play.earthmc.net")
    
    return {
        serverOnline: !!serverData,
        online: serverData?.players?.online ?? 0,
        max: serverData?.players?.max ?? 0
    }
}

async function getServerInfo() {
    try {
        const serverData = await getServerData(),
              novaData = await endpoint.playerData("nova"),
              auroraData = await endpoint.playerData("aurora")

        const online = serverData.online
        const novaCount = novaData.currentcount ?? 0
        const auroraCount = auroraData.currentcount ?? 0

        const serverInfo = { ...serverData, nova: novaCount, aurora: auroraCount }
        const queue = online < 1 ? 0 : online - auroraCount - novaCount

        return { queue, ...serverInfo }
    }
    catch (err: unknown) {
        throw new Errors.FetchError(`Error fetching server info!\n${err}`)
    }
}

const Aurora = new Map('aurora')
const Nova = new Map('nova')

export { formatString } from './utils/functions.js'
export {
    Errors,
    OfficialAPI, 
    endpoint, 
    getServerInfo,
    Aurora, Nova,
    Map
}
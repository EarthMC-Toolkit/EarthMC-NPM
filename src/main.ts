import * as endpoint from './utils/endpoint.js'

import { FetchError } from "./utils/errors.js"
import { Map } from './Map.js'

import MCAPI from "mojang-lib"
import { OAPIV2, OAPIV3 } from './OAPI.js'

const Aurora = new Map('aurora')
const Nova = new Map('nova')

async function fetchServer(name = "play.earthmc.net") {
    const server = await MCAPI.servers.get(name)

    return {
        max: server?.players?.max ?? 0,
        online: server?.players?.online ?? 0,
        serverOnline: !!server
    }
}

async function getServerInfo() {
    try {
        const serverData = await fetchServer()
        const novaData = await endpoint.playerData("nova")
        const auroraData = await endpoint.playerData("aurora")

        const online = serverData.online
        const novaCount = novaData.currentcount ?? 0
        const auroraCount = auroraData.currentcount ?? 0

        const serverInfo = { 
            ...serverData, 
            nova: novaCount, 
            aurora: auroraCount 
        }

        return { 
            queue: online < 1 ? 0 : online - auroraCount - novaCount,
            ...serverInfo 
        }
    } catch (err: unknown) {
        throw new FetchError(`Error fetching server info!\n${err}`)
    }
}

export { formatString } from './utils/functions.js'

export * from "./types.js"
export * from "./utils/errors.js"

const OfficialAPI = {
    V2: OAPIV2,
    V3: OAPIV3
}

export {
    MCAPI as MojangLib,
    OfficialAPI, 
    endpoint,
    fetchServer,
    getServerInfo,
    Aurora, Nova,
    Map
}
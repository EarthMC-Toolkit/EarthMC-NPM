import * as endpoint from './utils/endpoint.js'
import { FetchError } from "./utils/errors.js"

import Dynmap from './api/dynmap/Dynmap.js'
import Squaremap from './api/squaremap/Squaremap.js'

import MCAPI from "mojang-lib"
import { OAPIV2, OAPIV3 } from './OAPI.js'
import type { PlayersResponse } from './types/index.js'

const Aurora = new Squaremap('aurora')
const Nova = new Dynmap('nova')

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
        const novaData = await endpoint.playerData<PlayersResponse>("nova")
        const auroraData = await endpoint.playerData<PlayersResponse>("aurora")

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

export class OfficialAPI {
    static V2 = OAPIV2
    static V3 = OAPIV3
}

export {
    MCAPI as MojangLib,
    endpoint,
    fetchServer,
    getServerInfo,
    Aurora, Nova,
    Dynmap, Squaremap
}

export * from "./types/index.js"
export * from "./utils/errors.js"
export { formatString } from './utils/functions.js'
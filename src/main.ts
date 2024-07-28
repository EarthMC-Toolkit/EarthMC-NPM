import * as endpoint from './utils/endpoint.js'
import { FetchError } from "./utils/errors.js"

import Dynmap from './api/dynmap/Dynmap.js'
import Squaremap from './api/squaremap/Squaremap.js'

import MCAPI from "mojang-lib"
import { OAPIV2, OAPIV3 } from './OAPI.js'

export async function fetchServer(name = "play.earthmc.net") {
    const server = await MCAPI.servers.get(name)

    return {
        isOnline: !!server,
        players: {
            max: server?.players?.max ?? 0,
            online: server?.players?.online ?? 0
        }
    }
}

export async function getServerInfo(aurora: { numOnline: number }) {
    try {
        const serverData = await fetchServer()
        const online = serverData.players.online

        const auroraCount = aurora.numOnline < 1 ? 0 : aurora.numOnline 
        const queue = online < 1 ? 0 : online - auroraCount

        return { queue, ...serverData }
    } catch (err: unknown) {
        throw new FetchError(`Error fetching server info!\n${err}`)
    }
}

export class OfficialAPI {
    static V2 = OAPIV2
    static V3 = OAPIV3
}

export const Aurora = new Squaremap('aurora')

export {
    Dynmap, Squaremap,
    MCAPI as MojangLib,
    endpoint
}

export * from "./types/index.js"
export * from "./utils/errors.js"
export { formatString } from './utils/functions.js'
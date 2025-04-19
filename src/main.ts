import * as endpoint from './utils/endpoint.js'
import { FetchError } from "./utils/errors.js"

import Dynmap from './api/dynmap/Dynmap.js'
import Squaremap from './api/squaremap/Squaremap.js'

import MCAPI from "mojang-lib"
import { OAPIV3 } from './OAPI.js'

import type { SquaremapPlayersResponse } from './types/index.js'

export type ServerName = `${string}.earthmc.net`

export async function fetchServer(name: ServerName = "play.earthmc.net") {
    const server = await MCAPI.servers.get(name)

    return {
        isOnline: !!server,
        players: {
            max: server?.players?.max ?? 0,
            online: server?.players?.online ?? 0
        }
    }
}

export async function getServerInfo(aurora?: { numOnline: number }) {
    try {
        const serverData = await fetchServer()
        const online = serverData.players.online // Online across the whole server.

        let auroraNumOnline = aurora?.numOnline
        if (!auroraNumOnline) {
            // Not supplying own aurora count, gather it.
            const auroraPlayersRes: SquaremapPlayersResponse = await endpoint.playerData("aurora") 
            auroraNumOnline = auroraPlayersRes.players.length
        }

        const auroraCount = auroraNumOnline < 1 ? 0 : auroraNumOnline 

        return { 
            ...serverData,
            aurora: {
                online: auroraCount,
                invisible: online < 1 ? 0 : online - auroraCount
            }
        }
    } catch (err: unknown) {
        throw new FetchError(`Error fetching server info!\n${err}`)
    }
}

export class OfficialAPI {
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
export * from './utils/functions.js'
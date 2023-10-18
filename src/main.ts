import OfficialAPI from './OAPI.js'

import { MCAPI } from "mojang-lib"
import { Map } from './Map.js'

import * as endpoint from './utils/endpoint.js'
import * as Errors from "./utils/errors.js"

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
        const serverData = await fetchServer(),
              novaData = await endpoint.playerData("nova"),
              auroraData = await endpoint.playerData("aurora")

        const online = serverData.online
        const novaCount = novaData.currentcount ?? 0
        const auroraCount = auroraData.currentcount ?? 0

        const serverInfo = { ...serverData, nova: novaCount, aurora: auroraCount }
        const queue = online < 1 ? 0 : online - auroraCount - novaCount

        return { queue, ...serverInfo }
    } catch (err: unknown) {
        throw new Errors.FetchError(`Error fetching server info!\n${err}`)
    }
}

const Aurora = new Map('aurora')
const Nova = new Map('nova')

export { formatString } from './utils/functions.js'
export {
    Errors,
    MCAPI as MojangLib,
    OfficialAPI, 
    endpoint,
    fetchServer,
    getServerInfo,
    Aurora, Nova,
    Map
}
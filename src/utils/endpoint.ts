import { request, useDefaultAgent } from "undici-shim"
import endpoints from '../endpoints.json'
import { ConfigResponse, MapResponse, PlayersResponse, ValidMapName } from "../types.js"

import { genRandomString } from './functions.js'

if (useDefaultAgent) useDefaultAgent()

/**
 * @internal
 * Gets the appropriate endpoint from the given keys.
 */
const get = (dataType: keyof typeof endpoints, map: ValidMapName) => {
    //@ts-ignore
    return (endpoints[dataType][map.toLowerCase()]) as string
}

/**
 * @internal
 * Used internally to send a **GET** request to the specified URL 
 * and retrieve the response as a **JSON** object.
 * 
 * This method does the following:
 * - Uses a proxy when in browser environment to bypass CORS.
 * - Retries a failed request up to 3 times by default.
 * 
 * @param url - The full URL to send the request to.
 * @param retries - The amount of retries to attempt before erroring.
 */
const asJSON = async (url: string, retries = 3) => {
    const isBrowser = typeof window === "object"
    if (isBrowser) url = `https://corsproxy.io/?${encodeURIComponent(url)}`

    const res = await request(url)
        .then((res: any) => res.body?.json() || res.json())
        .catch(async err => await retry(err, url, retries))
    
    return res ?? await retry(null, url, retries)
}

const retry = (val: any, url: string, amt: number): any => amt === 1 ? val : asJSON(url, amt - 1)

let archiveTs = 0
const useArchive = (ts: number) => archiveTs = ts
const getArchive = async (url: string, unixTs = Date.now()) => {
    const date = new Date(unixTs * 1000),
          formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

const configData = (mapName: ValidMapName) => 
    asJSON(get("config", mapName)) as unknown as ConfigResponse

const playerData = (mapName: ValidMapName) => 
    asJSON(get("players", mapName)) as unknown as PlayersResponse

const mapData = async (mapName: ValidMapName) => {
    const url = await get("map", mapName)
    const res: unknown = await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)

    return res as MapResponse
}
    
const townyData = async (endpoint = '', version = 'v2') => {
    if (endpoint.startsWith("/"))
        endpoint.replace("/", "")

    const url = get("towny", `${version}/aurora`)
    return await asJSON(`${url}${endpoint}?${genRandomString()}`) as unknown
}

export {
    get, asJSON, 
    useArchive, getArchive, 
    configData, 
    playerData,
    townyData,
    mapData
}
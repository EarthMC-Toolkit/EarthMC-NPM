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
    return (endpoints[dataType][map.toLowerCase()]) as string
}

/**
 * @internal
 * Used internally to send a **GET** request to the specified URL 
 * and retrieve the response as a **JSON** object.
 * 
 * This method does the following:
 * - Uses a proxy in browser runtimed to bypass CORS.
 * - 
 * 
 * @param url - The full URL to send the request to.
 * @param n - The number of retries to attempt.
 */
const asJSON = async (url: string, /** @defaultValue `3` */ n = 3) => {
    const isBrowser = typeof window === "object"
    if (isBrowser) url = `https://corsproxy.io/?${encodeURIComponent(url)}`

    const res = await request(url)
        .then((res: any) => res.body?.json() || res.json())
        .catch(async err => await retry(err, url, n))
    
    return res ?? await retry(null, url, n)
}

const retry = (val: any, url: string, n: number): any => n === 1 ? val : asJSON(url, n - 1)

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

const townyData = async (endpoint = '', version = 'v1') => {
    if (endpoint.startsWith("/"))
        endpoint.replace("/", "")

    const url = get("towny", `${version}/aurora`)
    return await asJSON(`${url}${endpoint}?${genRandomString()}`) as unknown
}

const mapData = async (mapName: ValidMapName) => {
    const url = await get("map", mapName)
    const res: unknown = await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)

    return res as MapResponse
}

export {
    get, asJSON, 
    useArchive, getArchive, 
    configData, 
    playerData,
    townyData,
    mapData
}
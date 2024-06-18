import { request } from "undici"
import endpoints from '../endpoints.json'
import { ConfigResponse, MapResponse, PlayersResponse, ValidMapName } from "../types.js"

import { genRandomString } from './functions.js'

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
 * @param url - The full URL to send the request to.
 * @param retries - The amount of retries to attempt before erroring. Default is 3.
 */
const asJSON = async (url: string, retries = 3) => {
    const res = await request(url)
        .then(res => res.body?.json())
        .catch(async err => await retry(err, url, retries))
    
    return res ?? await retry(null, url, retries)
}

const retry = (val: any, url: string, amt: number): any => amt === 1 ? val : asJSON(url, amt - 1)

let archiveTs = 0
const useArchive = (ts: number) => archiveTs = ts
const getArchive = async (url: string, unixTs = Date.now()) => {
    const date = new Date(unixTs * 1000)
    const formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

const configData = async (mapName: ValidMapName) => 
    await asJSON(get("config", mapName)) as ConfigResponse

const playerData = async (mapName: ValidMapName) => 
    await asJSON(get("players", mapName)) as PlayersResponse

const mapData = async (mapName: ValidMapName) => {
    const url = await get("map", mapName)
    const res: unknown = await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)

    return res as MapResponse
}

/**
 * Gets info from a given Official API endpoint.
 * 
 * By "towny" we are referring to the data that we receive (balance, registration date etc).
 * @param endpoint The endpoint not including the domain, e.g: "lists/nations"
 */
const townyData = async (endpoint = '') => {
    if (endpoint.startsWith("/"))
        endpoint.replace("/", "")

    const url = get("towny", "v2/aurora")
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
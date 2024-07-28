import endpoints from '../endpoints.json'

import { request, type Dispatcher } from "undici"
import type { AnyMap } from "../types/index.js"

import { genRandomString } from './functions.js'

export type V3RequestBody<T> = {
    query: T
    [key: string]: any
}

export type EndpointVersion = 'v2' | 'v3'
export type ReqOptions = { dispatcher?: Dispatcher } 
    & Omit<Dispatcher.RequestOptions, 'origin' | 'path' | 'method'> 
    & Partial<Pick<Dispatcher.RequestOptions, 'method'>>

/**
 * @internal
 * Gets the appropriate endpoint from the given keys.
 */
const get = (dataType: keyof typeof endpoints, map: string) => {
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
const asJSON = async (url: string, options: ReqOptions = null, retries = 3) => {
    const res = await request(url, options)
        .then(res => res.body?.json())
        .catch(async err => await retry(err, url, retries))
    
    return res ?? await retry(null, url, retries)
}

const retry = (val: any, url: string, amt: number): any => amt === 1 ? val : asJSON(url, null, amt - 1)

let archiveTs = 0
const useArchive = (ts: number) => archiveTs = ts
const getArchive = async (url: string, unixTs = Date.now()) => {
    const date = new Date(unixTs * 1000)
    const formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

const configData = async <T>(mapName: AnyMap): Promise<T> => asJSON(get("config", mapName)) as T
const playerData = async <T>(mapName: AnyMap): Promise<T> => {
    const url = mapName.toLowerCase() == 'aurora' ? get('squaremap', 'players') : get("players", mapName)
    return asJSON(url)
}

const mapData = async <T>(mapName: AnyMap): Promise<T> => {
    const url = mapName.toLowerCase() == 'aurora' ? get('squaremap', 'map') : get("map", mapName)
    return !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
}

/**
 * Gets info from a given Official API endpoint.
 * 
 * By "towny" we are referring to the data that we receive (balance, registration date etc).
 * @param endpoint The endpoint not including the domain, e.g: "lists/nations"
 */
const townyData = async <T>(endpoint = '', version: EndpointVersion = 'v3', body?: V3RequestBody<T>) => {
    if (endpoint.startsWith("/")) {
        endpoint.replace("/", "")
    }

    if (version == "v3") {
        const url = get("towny", "v3/aurora")

        return body ? asJSON(`${url}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body)
        }) : asJSON(`${url}${endpoint}`)
    }

    const url = get("towny", "v2/aurora")
    return asJSON(`${url}${endpoint}?${genRandomString()}`) as unknown     
}

export {
    get, asJSON, 
    useArchive, getArchive, 
    configData, 
    playerData,
    townyData,
    mapData
}
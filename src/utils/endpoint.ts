import endpoints from '../endpoints.json'

import { request, type Dispatcher } from "undici"
import type { AnyMap, RequestBodyV3 } from "../types/index.js"

export type EndpointVersion = 'v3'
export type ReqOptions = { dispatcher?: Dispatcher } 
    & Omit<Dispatcher.RequestOptions, 'origin' | 'path' | 'method'> 
    & Partial<Pick<Dispatcher.RequestOptions, 'method'>>

/**
 * @internal
 * Gets the appropriate endpoint from the given keys.
 */
export const getEndpointUrl = (dataType: keyof typeof endpoints, map: string) => {
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
export const asJSON = async (url: string, options: ReqOptions = null, retries = 3) => {
    const res = await request(url, options)
        .then(res => res.body?.json())
        .catch(async err => await retry(err, url, retries))
    
    return res ?? await retry(null, url, retries)
}

const retry = (val: any, url: string, amt: number): any => amt === 1 ? val : asJSON(url, null, amt - 1)

let archiveTs = 0
export const useArchive = (ts: number) => archiveTs = ts
export const getArchive = async (url: string, unixTs = Date.now()) => {
    const formattedTs = new Date(unixTs * 1000)
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

export const configData = async <T>(mapName: AnyMap): Promise<T> => 
    asJSON(getEndpointUrl("config", mapName))

export const playerData = async <T>(mapName: AnyMap): Promise<T> => {
    const url = mapName.toLowerCase() == 'aurora' 
        ? getEndpointUrl('squaremap', 'players') 
        : getEndpointUrl("players", mapName)

    return asJSON(url)
}

export const mapData = async <T>(mapName: AnyMap): Promise<T> => {
    const url = mapName.toLowerCase() == 'aurora' 
        ? getEndpointUrl('squaremap', 'map') 
        : getEndpointUrl("map", mapName)

    return !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
}

/**
 * Gets info from a given Official API endpoint.\
 * If `endpoint` is an empty string or not provided, it will get the base `v3/aurora` endpoint.
 * @param endpoint The endpoint not including the domain, e.g: "/nations"
 */
export const oapiDataV3 = async <TQuery>(
    endpoint?: string,
    body?: RequestBodyV3<TQuery>
) => {
    // make sure null/undefined is string
    if (!endpoint) endpoint = ''

    const url = getEndpointUrl("towny", "v3/aurora")
    
    if (!body) return asJSON(`${url}${endpoint}`)
    return asJSON(`${url}${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body)
    })
}
import { editPlayerProps } from '../utils/functions.js'
import * as endpoint from '../utils/endpoint.js'

import { Mutex } from 'async-mutex'
import Cache from 'timed-cache'
import { MapResponse, ValidMapName } from '../types.js'

class DataHandler {
    #isNode = true
    #cache: any = null

    #map: ValidMapName

    constructor(mapName: ValidMapName) {
        this.#map = mapName
        this.#isNode = globalThis.process?.release?.name == 'node'
    }

    static createCache = async (ttl = 120*1000) =>{
        const cacheLock = new Mutex()
        const release = await cacheLock.acquire()
    
        try {
            // @ts-expect-error
            return new Cache({ defaultTtl: ttl })
        } 
        catch (e) {
            console.error(e)
        } finally {
            release()
        }
    }

    readonly handle = (key: string) => this.#cache?.cache[`__cache__${key}`]?.handle
    readonly mapData = async () => {
        if (!this.#cache)
            this.#cache = await DataHandler.createCache()

        if (this.#isNode)
            this.handle('mapData')?.ref()

        let md: MapResponse | null = null
        const cached = this.getFromCache('mapData')

        if (!cached) {
            md = await endpoint.mapData(this.#map)

            this.putInCache('mapData', md)
            this.unrefIfNode()
        }

        return md
    }

    readonly getFromCache = (key: string) => this.#cache?.get(key)
    readonly putInCache = (key: string, value: any) => this.#cache.put(key, value)

    readonly unrefIfNode = () => {
        if (this.#isNode)
            this.handle('mapData')?.unref()
    }

    readonly playerData = () => endpoint.playerData(this.#map)
    readonly configData = () => endpoint.configData(this.#map)

    readonly onlinePlayerData = async () => {
        const pData = await this.playerData()
        return pData?.players ? editPlayerProps(pData.players) : null
    }

    readonly markerset = async () => {
        const mapData = await this.mapData()
        return mapData?.sets["townyPlugin.markerset"]
    }
}

export default DataHandler
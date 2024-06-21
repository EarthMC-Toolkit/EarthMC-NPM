import { editPlayerProps } from '../utils/functions.js'
import * as endpoint from '../utils/endpoint.js'

import { Mutex } from 'async-mutex'
import { ConfigResponse, MapResponse, PlayersResponse, ValidMapName } from '../types.js'

class DataHandler {
    #isNode = true
    #cache: any

    #map: ValidMapName

    #cacheLock: Mutex

    constructor(mapName: ValidMapName) {
        this.#map = mapName
        this.#isNode = globalThis.process?.release?.name == 'node'

        this.#cacheLock = new Mutex()
    }

    private createCache = async (ttl = 120*1000) => {
        const release = await this.#cacheLock.acquire()
        let cacheInstance = null

        try {
            //@ts-expect-error 
            cacheInstance = import('timed-cache').then(tc => new tc.default({ defaultTtl: ttl }))
        } catch (e) {
            console.error(e)
        } finally {
            release()
        }

        return cacheInstance
    }
    
    readonly handle = (key: string) => this.#cache?.cache[`__cache__${key}`]?.handle
    readonly mapData = async () => {
        if (!this.#cache)
            this.#cache = await this.createCache()

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

    readonly playerData = () => endpoint.playerData<PlayersResponse>(this.#map)
    readonly configData = () => endpoint.configData<ConfigResponse>(this.#map)

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
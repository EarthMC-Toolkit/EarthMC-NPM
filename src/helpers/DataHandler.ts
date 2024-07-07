import * as endpoint from '../utils/endpoint.js'

import { Mutex } from 'async-mutex'
import type { AnyMap } from '../types/index.js'

class DataHandler {
    #map: AnyMap
    get map() { return this.#map }

    #cache: any
    #cacheTTL: number
    #cacheLock: Mutex

    //#isNode = true

    constructor(mapName: AnyMap, cacheTTL: number) {
        this.#map = mapName
        //this.#isNode = globalThis.process?.release?.name == 'node'

        this.#cacheLock = new Mutex()
        this.#cacheTTL = cacheTTL < 1 ? 1 : cacheTTL
    }

    private createCache = async() => {
        const release = await this.#cacheLock.acquire()
        let cacheInstance = null

        try {
            cacheInstance = import('@isaacs/ttlcache').then(tc => new tc.default({ ttl: this.#cacheTTL * 1000 }))
        } catch (e) {
            console.error(e)
        } finally {
            release()
        }

        return cacheInstance
    }

    readonly getFromCache = (key: string) => this.#cache?.get(key)
    readonly putInCache = <T>(key: string, value: T) => this.#cache?.set(key, value)
    readonly setKeyTTL = (key: string, ttl: number) => this.#cache?.setTTL(key, ttl)

    readonly playerData = <T>() => endpoint.playerData<T>(this.map)
    readonly configData = <T>() => endpoint.configData<T>(this.map)

    readonly mapData = async<T>() => {
        if (!this.#cache) {
            this.#cache = await this.createCache()
        }

        const cached: T = this.getFromCache('mapData')
        if (!cached) {
            const data: T = await endpoint.mapData(this.#map)

            this.putInCache('mapData', data)
            return data
        }

        return cached
    }
}

export default DataHandler
import * as endpoint from 'utils/endpoint.js'

import { Mutex } from 'async-mutex'
import type { AnyMap } from 'types'

class DataHandler {
    #map: AnyMap
    get map() { return this.#map }

    #cache: any
    #cacheTTL: number
    #cacheLock: Mutex

    #isNode = true

    constructor(mapName: AnyMap, cacheTTL = 60) {
        this.#map = mapName
        this.#isNode = globalThis.process?.release?.name == 'node'

        this.#cacheLock = new Mutex()
        this.#cacheTTL = cacheTTL
    }

    private createCache = async() => {
        const release = await this.#cacheLock.acquire()
        let cacheInstance = null

        try {
            //@ts-expect-error
            cacheInstance = import('timed-cache').then(tc => new tc.default({ defaultTtl: this.#cacheTTL }))
        } catch (e) {
            console.error(e)
        } finally {
            release()
        }

        return cacheInstance
    }
    
    readonly handle = (key: string) => this.#cache?.cache[`__cache__${key}`]?.handle

    readonly getFromCache = (key: string) => this.#cache?.get(key)
    readonly putInCache = (key: string, value: any) => this.#cache.put(key, value)

    readonly refIfNode = () => {
        if (!this.#isNode) return
        this.handle('mapData')?.ref()
    }

    readonly unrefIfNode = () => {
        if (!this.#isNode) return
        this.handle('mapData')?.unref()
    }

    readonly playerData = <T>() => endpoint.playerData<T>(this.map)
    readonly configData = <T>() => endpoint.configData<T>(this.map)

    readonly mapData = async<T>() => {
        if (!this.#cache) {
            this.#cache = await this.createCache()
        }

        this.refIfNode()

        const cached = this.getFromCache('mapData')
        let md: T | null = null

        if (!cached) {
            md = await endpoint.mapData(this.#map)

            this.putInCache('mapData', md)
            this.unrefIfNode()
        }

        return md
    }
}

export default DataHandler
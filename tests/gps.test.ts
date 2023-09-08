import { describe, it, expect } from 'vitest'

import { NotFoundError } from '../src/utils/errors'

describe('GPS', () => {
    const sampleLoc = { x: -5100, z: 240 }

    it('can find the safest route', async () => {
        const route = await globalThis.Aurora.GPS.safestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    it('can find the fastest route', async () => {
        const route = await globalThis.Aurora.GPS.fastestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    it('can check player is online when emitting', async () => { 
        const player = await globalThis.Aurora.GPS.getPlayer('Owen3H')
        expect(player).not.toBeInstanceOf(NotFoundError)

        const online = await globalThis.Aurora.GPS.playerIsOnline(player)
        expect(online).toEqual(false)
    })

    it('can throw not found error', async () => { 
        const player = await globalThis.Aurora.GPS.getPlayer('29394dsaklmsd')
        expect(player).toBeInstanceOf(NotFoundError)
    })
})
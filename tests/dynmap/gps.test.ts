import { describe, it, expect, assertType } from 'vitest'
import { Player } from '../../src/types'

describe('[Dynmap/Nova] GPS', () => {
    const sampleLoc = { x: -8000, z: 100 }

    it('can find the safest route', async () => {
        const route = await globalThis.Nova.GPS.safestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    it('can find the fastest route', async () => {
        const route = await globalThis.Nova.GPS.fastestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    it('can check player is online when emitting', async () => {
        const ops = await globalThis.Nova.Players.online()
        expect(ops).toBeDefined()
        expect(ops).toBeTruthy()
        assertType<Player[]>(ops)

        const op = await globalThis.Nova.Players.get(ops[0]['name'])
        expect(op).toBeTruthy()

        const online = await globalThis.Nova.GPS.playerIsOnline(op)
        expect(online).toEqual(true)
    })
})
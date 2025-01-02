import { describe, it, expect } from 'vitest'
import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] GPS', () => {
    const sampleLoc = { x: -8000, z: 100 }

    it('can find the safest route', async() => {
        const route = await Aurora.GPS.safestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    it('can find the fastest route', async() => {
        const route = await Aurora.GPS.fastestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
    })

    // it('can check player is online when emitting', async () => {
    //     const ops = await Nova.Players.online()
    //     expect(ops).toBeDefined()
    //     expect(ops).toBeTruthy()
    //     assertType<Player[]>(ops)

    //     const op = await Nova.Players.get(ops[0]['name'])
    //     expect(op).toBeTruthy()

    //     const online = await Nova.GPS.playerIsOnline(op)
    //     expect(online).toEqual(true)
    // })
})
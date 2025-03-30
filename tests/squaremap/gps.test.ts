import { describe, it, expect } from 'vitest'
import { Aurora } from '../../src/main'
import { GPS } from '../../src/api/squaremap/GPS'

describe('[Squaremap/Aurora] GPS', () => {
    it('can find the safest route', async () => {
        const sampleLoc = { x: 10000, z: -2000 }
        const route = await Aurora.GPS.safestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)
        
        expect(route.nation).toBeDefined()
    })

    it('can find the fastest route', async () => {
        const sampleLoc = { x: 10000, z: -2000 }
        const route = await Aurora.GPS.fastestRoute(sampleLoc)

        expect(route).toBeDefined()
        expect(route.distance).toBeGreaterThanOrEqual(0)

        expect(route.nation).toBeDefined()
        expect(route.nation.name).toBe("Socotra")
    })

    it('can return the correct basic cardinal direction', async () => {
        const sampleOrigin = { x: 0, z: 0 }

        let dir = GPS.cardinalDirection(sampleOrigin, { x: 0, z: -15000 }, false) // Arctic
        expect(dir).toBe("North")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 0, z: 15000 }, false) // Antarctica
        expect(dir).toBe("South")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 15000, z: 0 }, false)
        expect(dir).toBe("East")

        dir = GPS.cardinalDirection(sampleOrigin, { x: -15000, z: 0 }, false)
        expect(dir).toBe("West")
    })

    it('can return the correct cardinal direction (with intermediates)', () => {
        const sampleOrigin = { x: 0, z: 0 }

        let dir = GPS.cardinalDirection(sampleOrigin, { x: 0, z: -15000 }) // Arctic
        expect(dir).toBe("North")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 0, z: 15000 }) // Antarctica
        expect(dir).toBe("South")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 15000, z: 0 })
        expect(dir).toBe("East")

        dir = GPS.cardinalDirection(sampleOrigin, { x: -15000, z: 0 })
        expect(dir).toBe("West")

        dir = GPS.cardinalDirection(sampleOrigin, { x: -15000, z: -15000 })
        expect(dir).toBe("North-West")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 15000, z: -15000 })
        expect(dir).toBe("North-East")

        dir = GPS.cardinalDirection(sampleOrigin, { x: -15000, z: 15000 })
        expect(dir).toBe("South-West")

        dir = GPS.cardinalDirection(sampleOrigin, { x: 15000, z: 15000 })
        expect(dir).toBe("South-East")
    })

    it('can return valid travel times given a distance', () => {
        const times = GPS.calcTravelTimes(5000)
        expect(times).toBeDefined()

        expect(times.sneaking).toBeTypeOf('number')
        expect(times.walking).toBeTypeOf('number')
        expect(times.sprinting).toBeTypeOf('number')
        expect(times.boat).toBeTypeOf('number')

        expect(times.sneaking).toBeGreaterThanOrEqual(0)
        expect(times.walking).toBeGreaterThanOrEqual(0)
        expect(times.sprinting).toBeGreaterThanOrEqual(0)
        expect(times.boat).toBeGreaterThanOrEqual(0)
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
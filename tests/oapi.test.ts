import { 
    describe, it, expect, 
    assertType 
} from 'vitest'

import { OfficialAPI } from '../src/main'
import { 
    RawServerInfoV3,
    RawPlayerV3,
    RawTownV3,
    RawEntityV3,
    RawNationV3
} from '../src/types'

describe('[v3] OfficialAPI', async() => {
    it('can get valid towny/server info', async () => {
        const info = await OfficialAPI.V3.serverInfo()
        
        expect(info).toBeDefined()
        assertType<RawServerInfoV3>(info)

        expect(info.status).toBeDefined()
        expect(info.timestamps).toBeDefined()
        expect(info.stats).toBeDefined()

        expect(info.stats.maxPlayers).toBeGreaterThan(0)
        expect(info.stats.numTowns).toBeGreaterThanOrEqual(1000)
        expect(info.stats.numNations).toBeGreaterThanOrEqual(100)
    }, 10000)

    it('can get UUID from Discord ID', async() => {
        const res = await OfficialAPI.V3.uuidFromDiscord("394828201215393794")

        expect(res).toBeDefined()
        assertType<string[]>(res)

        expect(res.length).toBe(1)
        expect(res[0]).toBe("b54ee7ae-e1c6-472d-86a2-bc95a1ffc0c2")
    })

    it('can get Discord ID from UUID', async() => {
        const res = await OfficialAPI.V3.discordFromUUID("b54ee7ae-e1c6-472d-86a2-bc95a1ffc0c2")

        expect(res).toBeDefined()
        assertType<string[]>(res)

        expect(res.length).toBe(1)
        expect(res[0]).toBe("394828201215393794")
    })

    it('can get player list', async() => {
        const playerList = await OfficialAPI.V3.playerList()
        
        expect(playerList).toBeDefined()
        expect(playerList.length).toBeGreaterThan(0)

        assertType<RawEntityV3[]>(playerList)
    }, 10000)

    it('can get valid player info', async() => {
        const players = await OfficialAPI.V3.players("Fix")

        expect(players).toBeDefined()
        expect(players.length).toBeGreaterThan(0)

        assertType<RawPlayerV3[]>(players)
    }, 10000)

    it('can get towns', async() => {
        const towns = await OfficialAPI.V3.towns("Sukhbaatar")

        expect(towns).toBeDefined()
        expect(towns.length).toBeGreaterThan(0)

        assertType<RawTownV3[]>(towns)
    })

    it('can get nations', async() => {
        const nations = await OfficialAPI.V3.nations("Venice")

        expect(nations).toBeDefined()
        expect(nations.length).toBeGreaterThan(0)

        assertType<RawNationV3[]>(nations)
    })
})

// describe('[v2] OfficialAPI', async () => {
//     it('can get valid towny/server info', async () => {
//         const info = await OfficialAPI.V2.serverInfo()
        
//         expect(info).toBeDefined()
//         assertType<RawServerInfoV2>(info)

//         expect(info.world).toBeDefined()
//         expect(info.players).toBeDefined()
//         expect(info.stats).toBeDefined()

//         expect(info.players.maxPlayers).toBeGreaterThan(0)
//         expect(info.stats.numTowns).toBeGreaterThanOrEqual(1000)
//         expect(info.stats.numNations).toBeGreaterThanOrEqual(100)
//     }, 10000)

//     it('can get valid resident', async () => {
//         const res = await OfficialAPI.V2.resident('fruitloopins')

//         expect(res).toBeDefined()
//         assertType<OAPIResident>(res)

//         expect(res.name).toBe("Fruitloopins")
//         //console.log(res)
//     }, 10000)

//     it('can get valid nation', async () => {
//         const nation = await OfficialAPI.V2.nation('venice')

//         expect(nation).toBeDefined()
//         assertType<OAPINation>(nation)

//         expect(nation.name).toBe("Venice")
//         console.log(nation)
//     }, 10000)

//     it('can get valid town', async () => {
//         const town = await OfficialAPI.V2.town('Sukhbaatar')

//         expect(town).toBeDefined()
//         assertType<OAPITown>(town)

//         expect(town.name).toBe("Sukhbaatar")

//         //console.log(`Stats: ${JSON.stringify(town.stats)}`)
//     }, 10000)
// })
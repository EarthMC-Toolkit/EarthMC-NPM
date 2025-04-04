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
    RawNationV3,
    RawPlayerStatsV3
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

    it('can get player stats info (with correct order)', async () => {
        const pStats = await OfficialAPI.V3.playerStats()
        
        expect(pStats).toBeDefined()
        assertType<RawPlayerStatsV3>(pStats)

        const keys = Object.keys(pStats)

        // Ensure its not empty or just an error object.
        expect(keys.length).toBeGreaterThan(10)

        // Ensure our custom order is correct
        expect(keys[0]).toBe("player_kills")
        expect(keys[1]).toBe("mob_kills")
        expect(keys[2]).toBe("deaths")

        // Ensure we got the values and not our default ones.
        expect(pStats["player_kills"]).not.toBe(0)
        expect(pStats["mob_kills"]).not.toBe(0)
        expect(pStats["deaths"]).not.toBe(0)
    }, 10000)

    // TODO: Add test for location

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
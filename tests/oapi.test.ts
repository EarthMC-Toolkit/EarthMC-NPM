import { 
    describe, it, expect, 
    assertType 
} from 'vitest'

import { OfficialAPI } from '../src/main'
import { ApiResident, ServerInfoRaw } from '../src/types'

describe('OfficialAPI', async () => {
    it('can get valid towny/server info (v2)', async () => {
        const info = await OfficialAPI.serverInfo()
        
        expect(info).toBeDefined()
        assertType<ServerInfoRaw>(info)

        expect(info.world).toBeDefined()
        expect(info.players).toBeDefined()
        expect(info.stats).toBeDefined()

        expect(info.players.maxPlayers).toBeGreaterThanOrEqual(150)
        expect(info.stats.numTowns).toBeGreaterThanOrEqual(2000)
        expect(info.stats.numNations).toBeGreaterThanOrEqual(300)
    })

    it('can get valid resident (v1)', async () => {
        const res = await OfficialAPI.resident('owen3h')

        expect(res).toBeDefined()
        assertType<ApiResident>(res)

        expect(res.name).toBe("Owen3H")
    })
})
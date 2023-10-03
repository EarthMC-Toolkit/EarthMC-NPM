import { 
    describe, it, expect, 
    assertType 
} from 'vitest'

import { OfficialAPI } from '../src/main'
import { OAPINation, OAPIResident, OAPITown, RawServerInfo } from '../src/types'

describe('OfficialAPI', async () => {
    it('can get valid towny/server info (v2)', async () => {
        const info = await OfficialAPI.serverInfo()
        
        expect(info).toBeDefined()
        assertType<RawServerInfo>(info)

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
        assertType<OAPIResident>(res)

        expect(res.name).toBe("Owen3H")
        //console.log(res)
    })

    it('can get valid nation (v1)', async () => {
        const nation = await OfficialAPI.nation('venice')

        expect(nation).toBeDefined()
        assertType<OAPINation>(nation)

        expect(nation.name).toBe("Venice")
        //console.log(nation)
    })

    it('can get valid nation (v1)', async () => {
        const town = await OfficialAPI.town('venice')

        expect(town).toBeDefined()
        assertType<OAPITown>(town)

        expect(town.name).toBe("Venice")
        console.log(town)
    })
})
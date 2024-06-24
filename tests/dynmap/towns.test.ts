import { 
    describe, it, 
    expect, assertType
} from 'vitest'

import { Town } from '../../src/types'
import { Nova } from '../../src/main'

describe('[Dynmap/Nova] Towns', () => {
    it('can get all towns', async () => {
        const towns = await Nova.Towns.all()
        assertType<Town[]>(towns)
    })

    it('can get single town', async () => {
        const town = await Nova.Towns.get('kraftier')

        expect(town).toBeTruthy()
        expect(town).toBeDefined()
        assertType<Town | Town[]>(town)
    })

    it('can get towns invitable to specified nation', async () => {
        const invitableTowns = await Nova.Towns.invitable('sudan')

        expect(invitableTowns).toBeTruthy()
        expect(invitableTowns).toBeDefined()
        assertType<Town[]>(invitableTowns)
    })
})
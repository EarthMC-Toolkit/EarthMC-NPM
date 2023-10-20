import { 
    describe, it, expect, 
    expectTypeOf, assertType 
} from 'vitest'

import { Town } from '../src/types'
import { Map } from '../src/Map' 

describe('Towns', () => {
    it('can get all towns', async () => {
        const towns = await globalThis.Aurora.Towns.all()
        assertType<Town[]>(towns)
    })

    it('can get single town without error', async () => {
        const town = await globalThis.Aurora.Towns.get('venice')

        expect(town).toBeDefined()
        expectTypeOf(town).not.toEqualTypeOf<Error>()
        assertType<Town[]>(town)

        console.log(town)
    })

    it('can get towns invitable to specified nation', async () => {
        const invitableTowns = await globalThis.Aurora.Towns.invitable('venice')

        expect(invitableTowns).toBeDefined()
        expectTypeOf(invitableTowns).not.toEqualTypeOf<Error>()
        assertType<Town[]>(invitableTowns)
    })

    it('should return different town info on Aurora and Nova', async () => {
        const Nova = new Map('nova')
        const [novaTown, auroraTown] = await Promise.all([
            Nova.Towns.get('Venice'), 
            globalThis.Aurora.Towns.get('Venice')
        ])

        expect(novaTown).not.toEqual(auroraTown)
        expect(novaTown['stats']).toBeUndefined()

        expect(auroraTown.stats).toBeDefined()
        expect(auroraTown.wiki).toBeDefined()
        expect(auroraTown.founder).toBeDefined()
        expect(auroraTown.created).toBeDefined()
    })
})
import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import type { Nation } from '../../src/types'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Nations', () => {
    it('can get all nations', async () => {
        const nations = await Aurora.Nations.all()
        assertType<Nation[]>(nations)
    })

    it('can get single nation', async () => {
        const nation = await Aurora.Nations.get('madagascar')

        expect(nation).toBeDefined()
        expectTypeOf(nation).not.toEqualTypeOf<Error>()
        assertType<Nation | Nation[]>(nation)

        expect(nation.name).toBe('Madagascar')
        //console.log(nation.residents.length)
    })
})
import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import type { Nation } from '../../src/types'

describe('[Squaremap/Aurora] Nations', () => {
    it('can get all nations', async () => {
        const nations = await globalThis.Aurora.Nations.all()
        assertType<Nation[]>(nations)
    })

    it('can get single nation', async () => {
        const nation = await globalThis.Aurora.Nations.get('madagascar')

        expect(nation).toBeDefined()
        expectTypeOf(nation).not.toEqualTypeOf<Error>()
        assertType<Nation | Nation[]>(nation)

        expect(nation.name).toBe('Madagascar')
        //console.log(nation.residents.length)
    })
})
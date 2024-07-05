import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import type { Nation } from '../../src/types'

import { Nova } from '../../src/main'

describe.skip('[Dynmap/Nova] Nations', () => {
    it('can get all nations', async () => {
        const nations = await Nova.Nations.all()
        assertType<Nation[]>(nations)
    })

    it('can get single nation', async () => {
        const nation = await Nova.Nations.get('sudan') as Nation

        expect(nation).toBeDefined()
        expectTypeOf(nation).not.toEqualTypeOf<Error>()
        assertType<Nation | Nation[]>(nation)

        expect(nation.name).toBe('Sudan')
        //console.log(nation)
    })
})
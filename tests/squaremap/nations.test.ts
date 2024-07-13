import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import type { Nation } from '../../src/types'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Nations', () => {
    it('can get all nations', async () => {
        const nations = await Aurora.Nations.all()
        assertType<Nation[]>(nations)
    })

    it('can get single nation', async () => {
        const nation = await Aurora.Nations.get('r.o.c')

        expect(nation).toBeTruthy()
        expectTypeOf(nation).not.toEqualTypeOf<Error>

        //@ts-expect-error
        assertType<Nation | Nation[]>(nation)

        //@ts-ignore
        expect(nation.name).toBe('R.O.C')
    })
})
import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import type { SquaremapNation } from '../../src/types'

import { Aurora, NotFoundError } from '../../src/main'

describe('[Squaremap/Aurora] Nations', () => {
    let nations: SquaremapNation[] = null

    it('can get all nations', async () => {
        nations = await Aurora.Nations.all()
        assertType<SquaremapNation[]>(nations)
    })

    it('has no nation with html tag in name', () => {
        expect(nations.some(n => n.name.includes("</a>") || n.name.includes("<a>"))).toBe(false)
    })

    it('can get single nation', async () => {
        const nation = await Aurora.Nations.get('r.o.c')

        expect(nation).toBeTruthy()
        expectTypeOf(nation).not.toEqualTypeOf<Error>

        //@ts-expect-error
        assertType<SquaremapNation | SquaremapNation[]>(nation)

        //@ts-ignore
        expect(nation.name).toBe('R.O.C')
    })

    it('can get multiple nations', async () => {
        const nations = await Aurora.Nations.get('SiBeRia', 'veNICE', 'verMOnt') as SquaremapNation[]

        expect(nations).toBeTruthy()
        expect(nations.length).toBe(3)
        expect(nations.some(n => n instanceof NotFoundError)).toBe(false)

        assertType<SquaremapNation[]>(nations)
    })
})
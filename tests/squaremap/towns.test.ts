import { 
    describe, it, 
    assertType,
    expect
} from 'vitest'

import { SquaremapTown } from '../../src/types'

describe('[Squaremap/Aurora] Towns', () => {
    it('can get all towns', async () => {
        const towns = await globalThis.Aurora.Towns.all()
        assertType<SquaremapTown[]>(towns)
    })

    it('can get single town', async () => {
        const town = await globalThis.Aurora.Towns.get('brisbane')

        expect(town).toBeTruthy()
        expect(town).toBeDefined()
        assertType<SquaremapTown | SquaremapTown[]>(town)
    })

    // it('can get towns invitable to specified nation', async () => {
    //     const invitableTowns = await globalThis.Aurora.Towns.invitable('sudan')

    //     expect(invitableTowns).toBeTruthy()
    //     expect(invitableTowns).toBeDefined()
    //     assertType<SquaremapTown[]>(invitableTowns)
    // })
})
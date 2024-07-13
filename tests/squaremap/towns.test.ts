import { 
    describe, it, 
    assertType,
    expect
} from 'vitest'

import { SquaremapTown } from '../../src/types'
import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Towns', () => {
    it('can get all towns', async () => {
        const towns = await Aurora.Towns.all()
        assertType<SquaremapTown[]>(towns)
    })

    // TODO: Verify there are no duplicates residents.
    it('can get single town', async () => {
        const town = await Aurora.Towns.get('Hengyang')
        expect(town).toBeTruthy()
        expect(town).toBeDefined()

        //@ts-expect-error
        assertType<SquaremapTown | SquaremapTown[]>(town)

        expect((town as SquaremapTown).nation).not.toBe("No Nation")
    })

    // it('can get towns invitable to specified nation', async () => {
    //     const invitableTowns = await Aurora.Towns.invitable('sudan')

    //     expect(invitableTowns).toBeTruthy()
    //     expect(invitableTowns).toBeDefined()
    //     assertType<SquaremapTown[]>(invitableTowns)
    // })
})
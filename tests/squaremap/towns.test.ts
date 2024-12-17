import { 
    describe, it, 
    assertType,
    expect
} from 'vitest'

import { SquaremapTown } from '../../src/types'
import { Aurora, NotFoundError } from '../../src/main'

describe('[Squaremap/Aurora] Towns', () => {
    let towns: SquaremapTown[] = null

    it('can get all towns', async () => {
        towns = await Aurora.Towns.all()
        assertType<SquaremapTown[]>(towns)
    })

    it('has no town with html tag in name', () => {
        expect(towns.some(t => t.name.includes("</a>") || t.name.includes("<a>"))).toBe(false)
    })

    // TODO: Verify there are no duplicates residents.
    it('can get single town', async () => {
        const town = await Aurora.Towns.get('Hengyang')
        expect(town).toBeTruthy()

        //@ts-expect-error
        assertType<SquaremapTown | SquaremapTown[]>(town)

        expect((town as SquaremapTown).nation).not.toBe("No Nation")
    })

    it('can get multiple towns', async () => {
        const towns = await Aurora.Towns.get('tORinO', 'LonDoN') as SquaremapTown[]
        expect(towns).toBeTruthy()

        expect(towns.some(n => n instanceof NotFoundError)).toBe(false)
        expect(towns.length).toBe(2)

        //console.log(towns)

        assertType<SquaremapTown[]>(towns)
    })

    // it('can get towns invitable to specified nation', async () => {
    //     const invitableTowns = await Aurora.Towns.invitable('sudan')

    //     expect(invitableTowns).toBeTruthy()
    //     expect(invitableTowns).toBeDefined()
    //     assertType<SquaremapTown[]>(invitableTowns)
    // })
})
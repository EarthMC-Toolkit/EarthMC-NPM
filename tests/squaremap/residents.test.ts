import { describe, it, expect, expectTypeOf, assertType } from 'vitest'
import { Resident } from '../../src/types'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Residents', () => {
    let res: Resident = null

    it('can get all residents', async () => {
        const residents = await Aurora.Residents.all()

        expect(residents).toBeTruthy()
        assertType<Resident[]>(residents)
    })

    it('can get single resident', async () => {
        const resident = await Aurora.Residents.get('3meraldk') as Resident

        expect(resident).toBeTruthy()
        expect(resident).toBeDefined()
        expectTypeOf(resident).not.toEqualTypeOf<Error>()
        assertType<Resident | Resident[]>(resident)

        res = resident
    })

    it('resident has correct info', () => {
        expect(res).toBeTruthy()

        expect(res.name).toBe("3meraldK")
        expect(res.rank).toBe("Mayor")
        expect(res.town).toBe("Krn")

        //console.log(res)
    })
})
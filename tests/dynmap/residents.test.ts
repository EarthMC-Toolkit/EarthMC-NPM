import { describe, it, expect, expectTypeOf, assertType } from 'vitest'
import { Resident } from '../../src/types'

import { Nova } from '../../src/main'

describe.skip('[Dynmap/Nova] Residents', () => {
    it('can get all residents', async () => {
        const residents = await Nova.Residents.all()
        assertType<Resident[]>(residents)
    })

    it('can get single resident', async () => {
        const resident = await Nova.Residents.get('3meraldk') as Resident

        expect(resident).toBeDefined()
        expectTypeOf(resident).not.toEqualTypeOf<Error>()
        assertType<Resident | Resident[]>(resident)

        expect(resident.name).toBe("3meraldK")
        expect(resident.rank).toBe("Mayor")
        //expect(resident.timestamps).toBeDefined()
        //expect(resident.timestamps.registered).toEqual(1652454407381)
    })
})
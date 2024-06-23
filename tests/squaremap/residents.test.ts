import { describe, it, expect, expectTypeOf, assertType } from 'vitest'
import { Resident } from '../../src/types'

describe('[Squaremap/Aurora] Residents', () => {
    let res: Resident = null

    it('can get all residents', async () => {
        const residents = await globalThis.Aurora.Residents.all()
        assertType<Resident[]>(residents)
    })

    it('can get single resident', async () => {
        const resident = await globalThis.Aurora.Residents.get('3meraldk')

        expect(resident).toBeDefined()
        expectTypeOf(resident).not.toEqualTypeOf<Error>()
        assertType<Resident | Resident[]>(resident)

        res = resident
    })

    it ('resident has correct info', () => {
        expect(res).toBeTruthy()

        expect(res.name).toBe("3meraldK")
        expect(res.rank).toBe("Mayor")
        expect(res.town).toBe("Krn")

        //console.log(res)
    })
})
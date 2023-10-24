import { describe, it, expect, expectTypeOf, assertType } from 'vitest'
import { Resident } from '../src/types'

import { 
    Map
} from '../src/main'

describe('Residents', () => {
    it('can get all residents', async () => {
        const residents = await globalThis.Aurora.Residents.all()
        assertType<Resident[]>(residents)
    })

    it('can get single resident without error', async () => {
        const resident = await globalThis.Aurora.Residents.get('3meraldk')

        expect(resident).toBeDefined()
        expectTypeOf(resident).not.toEqualTypeOf<Error>()
        assertType<Resident | Resident[]>(resident)

        expect(resident.name).toBe("3meraldK")
        expect(resident.rank).toBe("Mayor")
        //expect(resident.timestamps).toBeDefined()
        //expect(resident.timestamps.registered).toEqual(1652454407381)
    })

    it('should return different resident info on Aurora and Nova', async () => {
        const Nova = new Map('nova')
        const [novaRes, auroraRes] = await Promise.all([
            Nova.Residents.get('3meraldK'), 
            globalThis.Aurora.Residents.get('3meraldK')
        ]) as Resident[]

        expect(auroraRes.town).not.toBe(novaRes.town)
    })
})
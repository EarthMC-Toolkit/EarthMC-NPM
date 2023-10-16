import { describe, it, expect, expectTypeOf, assertType } from 'vitest'

import { Nation } from '../src/types'
import { Map } from '../src/Map'

describe('Nations', () => {
    it('can get all nations', async () => {
        const nations = await globalThis.Aurora.Nations.all()
        assertType<Nation[]>(nations)
    })

    it('can get single nation without error', async () => {
        const nation = await globalThis.Aurora.Nations.get('venice')

        expect(nation).toBeDefined()
        expectTypeOf(nation).not.toEqualTypeOf<Error>()
        assertType<Nation | Nation[]>(nation)

        expect(nation.name).toBe('Venice')
        console.log(nation)
    })

    it('should return different nation info on Aurora and Nova', async () => {
        const Nova = new Map('nova')
        const [novaNation, auroraNation] = await Promise.all([
            Nova.Nations.get('Yue'), 
            globalThis.Aurora.Nations.get('Yue')
        ]) as Nation[]
        
        expect(novaNation).not.toEqual(auroraNation)

        expect(novaNation.stats).toBeUndefined()
        expect(auroraNation.stats).toBeDefined()
    })
})
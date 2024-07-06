import { describe, it, expect,  assertType } from 'vitest'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Map', () => {
    it('can get accurate total map wealth', async () => {
        const wealth = await Aurora.globalWealth()

        expect(wealth).toBeTruthy()
        assertType<number>(wealth)
    })
})
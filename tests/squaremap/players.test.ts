import { describe, it, expect, assertType } from 'vitest'
import { Player } from '../../src/types'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Players', () => {
    it('can get all players (online + residents)', async () => {
        const all = await Aurora.Players.all()

        expect(all).toBeTruthy()
        assertType<Player[]>(all)
    })

    it('can get online players', async () => {
        const ops = await Aurora.Players.online()

        expect(ops).toBeTruthy()
        assertType<Player[]>(ops)
    })

    it('can get single online player', async () => {
        const op = await Aurora.Players.get('Alan_yy') as Player

        expect(op).toBeTruthy()
        assertType<Player | Player[]>(op)
    })

    it('can get townless players', async () => {
        const townless = await Aurora.Players.townless()

        expect(townless).toBeTruthy()
        assertType<Player[]>(townless)

        console.log(townless)
    })
})
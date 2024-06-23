import { describe, it, expect, assertType } from 'vitest'
import { Player } from '../../src/types'

describe('[Squaremap/Aurora] Players', () => {
    it('can get all players (online + residents)', async () => {
        const all = await globalThis.Aurora.Players.all()

        expect(all).toBeTruthy()
        assertType<Player[]>(all)
    })

    it('can get online players', async () => {
        const ops = await globalThis.Aurora.Players.online()

        expect(ops).toBeTruthy()
        assertType<Player[]>(ops)
    })

    it('can get single online player', async () => {
        const op = await globalThis.Aurora.Players.get('Alan_yy')

        expect(op).toBeTruthy()
        assertType<Player | Player[]>(op)
    })

    it('can get townless players', async () => {
        const townless = await globalThis.Aurora.Players.townless()

        expect(townless).toBeTruthy()
        assertType<Player[]>(townless)
    })
})
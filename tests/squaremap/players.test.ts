import { describe, it, expect, assertType } from 'vitest'
import { SquaremapOnlinePlayer, SquaremapPlayer } from '../../src/types'

import { Aurora } from '../../src/main'

describe('[Squaremap/Aurora] Players', () => {
    it('can get all players (online + residents)', async() => {
        const all = await Aurora.Players.all() as SquaremapPlayer[]

        expect(all).toBeTruthy()
        assertType<SquaremapPlayer[]>(all)
    })

    it('can get online players', async() => {
        const ops = await Aurora.Players.online() as SquaremapPlayer[]

        expect(ops).toBeTruthy()
        assertType<SquaremapPlayer[]>(ops)
    })

    it('can get online players (with resident info)', async() => {
        const ops = await Aurora.Players.online(true) as SquaremapPlayer[]

        expect(ops).toBeTruthy()
        expect(ops.every(x => x.online == true)).toBeTruthy()
    })

    it('can get single online player', async() => {
        const op = await Aurora.Players.get('Alan_yy') as SquaremapOnlinePlayer

        expect(op).toBeTruthy()
        assertType<SquaremapOnlinePlayer | SquaremapOnlinePlayer[]>(op)
    })

    it('can get townless players', async() => {
        const townless = await Aurora.Players.townless() as SquaremapPlayer[]

        expect(townless).toBeTruthy()
        assertType<SquaremapPlayer[]>(townless)

        //console.log(townless)
    })
})
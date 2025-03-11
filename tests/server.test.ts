import { expect, test } from 'vitest'
import { getServerInfo } from '../src/main'

test("can get server info (providing num online in each map)", async () => {
    const serverInfo = await getServerInfo()
    expect(serverInfo).toBeTruthy()

    expect(serverInfo.isOnline).toBeDefined()
    expect(serverInfo.isOnline).toBeTypeOf("boolean")

    expect(serverInfo.queue).toBeDefined()
    expect(serverInfo.queue).not.toBeLessThan(0)
    
    expect(serverInfo.players).toBeDefined()
    expect(serverInfo.players.max).toBeDefined()
    expect(serverInfo.players.online).toBeDefined()
})
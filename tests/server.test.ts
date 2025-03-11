import { expect, test } from 'vitest'
import { getServerInfo } from '../src/main'

test("can get server info (providing num online in each map)", async () => {
    const serverInfo = await getServerInfo()
    expect(serverInfo).toBeTruthy()

    expect(serverInfo.isOnline).toBeDefined()
    expect(serverInfo.queue).toBeDefined()
    
    expect(serverInfo.players).toBeDefined()
    expect(serverInfo.players.max).toBeDefined()
    expect(serverInfo.players.online).toBeDefined()
})
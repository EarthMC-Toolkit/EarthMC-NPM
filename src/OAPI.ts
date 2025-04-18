import {
    type RequestBodyV3,
    type RawServerInfoV3,
    type RawQuarterResponseV3, type RawEntityV3,
    type DiscordReqObjectV3, type DiscordResObjectV3,
    type LocationReqObjectV3, type LocationResObjectV3,
    type RawPlayerV3, type RawTownV3, type RawNationV3,
    type RawPlayerStatsV3,
    rawPlayerStatsTemplate
} from './types/index.js'

import { oapiDataV3 } from './utils/endpoint.js'

export class OAPIV3 {
    static get = <TBody>(endpoint: string, body?: RequestBodyV3<TBody>) => oapiDataV3(endpoint, body)

    // Instead of it's own endpoint, server info lives at the base URL.
    static serverInfo = (): Promise<RawServerInfoV3> => this.get('')
    static playerStats = async(): Promise<RawPlayerStatsV3> => {
        const pStats = await this.get('/player-stats')
        const keys = Object.keys(rawPlayerStatsTemplate)

        // Order the object according to the template.
        return Object.fromEntries(keys.map(key => [key, pStats[key] ?? 0])) as RawPlayerStatsV3
    }
    
    static location = (...objs: LocationReqObjectV3[]): Promise<LocationResObjectV3[]> => 
        this.get('/location', { query: objs })
    
    static discord = (...objs: DiscordReqObjectV3[]): Promise<DiscordResObjectV3[]> => 
        this.get('/discord', { query: objs })

    /**
     * Same as .discord() but passes only `discord` type for all, returning Minecraft UUIDs.
     * @param ids Discord ID string(s).
     */
    static uuidFromDiscord = async(...ids: string[]) => {
        const objs = ids.map(id => ({ type: 'discord', target: id }) satisfies DiscordReqObjectV3)
        const res = await this.discord(...objs)

        return res.map(r => r.uuid)
    }

    /**
     * Same as .discord() but passes only `minecraft` type for all, returning Discord IDs.
     * @param ids Minecraft UUID string(s).
     */
    static discordFromUUID = async(...uuids: string[]) => {
        const objs = uuids.map(uuid => ({ type: 'minecraft', target: uuid }) satisfies DiscordReqObjectV3)
        const res = await this.discord(...objs)
        
        return res.map(r => r.id)
    }

    static quarters = (...ids: string[]): Promise<RawQuarterResponseV3> => this.get('/quarters', { query: ids })
    static quarterList = (): Promise<RawEntityV3[]> => this.get('/quarters')

    static players = (...ids: string[]): Promise<RawPlayerV3[]> => this.get('/players', { query: ids })
    static playerList = (): Promise<RawEntityV3[]> => this.get('/players')

    static towns = (...ids: string[]): Promise<RawTownV3[]> => this.get(`/towns`, { query: ids })
    static townList = (): Promise<RawEntityV3[]> => this.get('/towns')

    static nations = (...ids: string[]): Promise<RawNationV3[]> => this.get(`/nations`, { query: ids })
    static nationList = (): Promise<RawEntityV3[]> => this.get('/nations')
}

export {
    OAPIV3 as default
}
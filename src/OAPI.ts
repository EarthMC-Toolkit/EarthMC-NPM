import type {
    RawTown, RawNation, RawResident,
    OAPITown, OAPIResident, OAPINation,
    RawServerInfoV2, RawServerInfoV3,
    RawQuarterResponseV3, RawEntityV3,
    DiscordReqObject, DiscordResObject,
    RawLocationResponseV3,
    RawPlayerV3
} from './types/index.js'

import { townyData } from './utils/endpoint.js'
import { FetchError } from './utils/errors.js'

const parseResident = (res: RawResident) => {
    const obj = {} as OAPIResident
    
    if (res.status)
        obj.status = res.status

    if (res.stats?.balance) 
        obj.balance = res.stats.balance

    if (res.timestamps) 
        obj.timestamps = res.timestamps

    if (res.name) obj.name = res.name
    if (res.uuid) obj.uuid = res.uuid
    if (res.title) obj.title = res.title
    if (res.surname) obj.surname = res.surname

    if (res?.town) obj.town = res.town
    if (res?.nation) obj.nation = res.nation

    if (res.ranks?.townRanks) obj.townRanks = res.ranks.townRanks
    if (res.ranks?.nationRanks) obj.nationRanks = res.ranks.nationRanks

    if (res.perms) {
        const perms = res.perms
        const rnaoPerms = perms.rnaoPerms

        obj.perms = {
            build: rnaoPerms.buildPerms,
            destroy: rnaoPerms.destroyPerms,
            switch: rnaoPerms.switchPerms,
            itemUse: rnaoPerms.itemUsePerms,
            flags: perms.flagPerms
        }
    }

    if (res.friends) 
        obj.friends = res.friends

    return obj
}

const parseTown = (town: RawTown) => {
    const rnao = town.perms.rnaoPerms

    const obj: any = {
        ...town,
        created: town.timestamps?.registered,
        joinedNation: town.timestamps?.joinedNationAt,
        perms: {
            build: rnao.buildPerms,
            destroy: rnao.destroyPerms,
            switch: rnao.switchPerms,
            itemUse: rnao.itemUsePerms,
            flags: town.perms.flagPerms
        }
    }

    delete obj.timestamps

    delete obj.perms.rnaoPerms
    delete obj.perms.flagPerms

    return obj as OAPITown
}

const parseNation = (nation: RawNation) => {
    const obj: any = {
        ...nation,
        created: nation.timestamps.registered
    }

    delete obj.timestamps

    return obj as OAPINation
}

const ParamErr = () => new SyntaxError(`Parameter 'name' is invalid. Must be of type string!`)
const FetchErr = (type: string, name: string) => new FetchError(`Could not fetch ${type} '${name}'. Invalid response received!`)

export class OAPIV3 {
    static serverInfo = (): Promise<RawServerInfoV3> => townyData('', 'v3')

    static location = (...objs: [number, number][]): Promise<RawLocationResponseV3> => 
        townyData('/location', 'v3', { query: objs })

    static discord = (...objs: DiscordReqObject[]): Promise<DiscordResObject[]> =>
        townyData('/discord', 'v3', { query: objs })

    /**
     * Same as .discord() but passes only `discord` type for all, returning Minecraft UUIDs.
     * @param ids Discord ID string(s).
     */
    static uuidFromDiscord = async (...ids: string[]) => {
        const objs = ids.map(id => ({ type: 'discord', target: id }) as DiscordReqObject)
        const res = await OAPIV3.discord(...objs)

        return res.map(r => r.uuid)
    }

    /**
     * Same as .discord() but passes only `minecraft` type for all, returning Discord IDs.
     * @param ids Minecraft UUID string(s).
     */
    static discordFromUUID = async (...uuids: string[]) => {
        const objs = uuids.map(uuid => ({ type: 'minecraft', target: uuid }) as DiscordReqObject)
        const res = await OAPIV3.discord(...objs)
        
        return res.map(r => r.id)
    }

    static quarters = (...ids: string[]): Promise<RawQuarterResponseV3> => townyData('/quarters', 'v3', { query: ids })
    static quarterList = (): Promise<RawEntityV3[]> => townyData('/quarters', 'v3')

    static players = (...ids: string[]): Promise<RawPlayerV3[]> => townyData('/players', 'v3', { query: ids })
    static playerList = (): Promise<RawEntityV3[]> => townyData('/players', 'v3')
}

export class OAPIV2 {
    static serverInfo = (): Promise<RawServerInfoV2> => townyData('', 'v2')

    static resident = async (name: string) => {
        if (!name) throw ParamErr()

        const res = await townyData(`/residents/${name}`, 'v2') as RawResident
        if (!res) throw FetchErr('resident', name)

        return parseResident(res)
    }

    static town = async (name: string) => {
        if (!name) throw ParamErr()

        const town = await townyData(`/towns/${name}`, 'v2') as RawTown
        if (!town) throw FetchErr('town', name)

        return parseTown(town)
    }

    static nation = async (name: string) => {
        if (!name) throw ParamErr()

        const nation = await townyData(`/nations/${name}`, 'v2') as RawNation
        if (!nation) throw FetchErr('nation', name)

        return parseNation(nation)
    }
}

export {
    OAPIV3 as default
}
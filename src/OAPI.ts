import type {
    RawTown,
    RawNation, 
    RawResident,
    OAPITown,
    OAPIResident,
    OAPINation,
    RawServerInfoV2,
    RawServerInfoV3
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

type DiscordReqObject = {
    type: 'minecraft' | 'discord'
    target: string
}

type DiscordResObject = {
    ID: string
    UUID: string
}

export class OAPIV3 {
    static serverInfo = async(): Promise<RawServerInfoV3> => await townyData('', 'v3')

    static discord = async (...objs: DiscordReqObject[]): Promise<DiscordResObject[]> => 
        await townyData('/discord', 'v3', { query: objs })

    static playerList = async (): Promise<{ name: string, uuid: string }[]> => 
        await townyData('/players', 'v3')

    static players = async (...ids: string[]): Promise<OAPIResident[]> => 
        await townyData('/players', 'v3', { query: ids })
}

export class OAPIV2 {
    static serverInfo = async (): Promise<RawServerInfoV2> => {
        return townyData('', 'v2')
    }

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
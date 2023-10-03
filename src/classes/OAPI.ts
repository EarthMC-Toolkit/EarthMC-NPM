import {
    RawTown,
    RawNation, 
    RawResident,
    RawServerInfo,
    OAPITown,
    OAPIResident,
    OAPINation
} from '../types.js'

import { townyData } from '../utils/endpoint.js'
import { FetchError } from '../utils/errors.js'

const parseResident = (res: RawResident) => {
    const obj: any = {}
    
    obj.online = res.status.isOnline

    if (res.stats?.balance) 
        obj.balance = res.stats.balance

    if (res.timestamps) 
        obj.timestamps = res.timestamps

    if (res.strings?.username) obj.name = res.strings.username
    if (res.strings?.title) obj.title = res.strings.title
    if (res.strings?.surname) obj.surname = res.strings.surname

    const affiliation = res.affiliation
    if (affiliation?.town) obj.town = affiliation.town
    if (affiliation?.nation) obj.nation = affiliation.nation

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

    return obj as OAPIResident
}

const parseTown = (town: RawTown) => {
    const rnao = town.perms.rnaoPerms
    const flags = town.perms.flagPerms

    const obj: any = {
        ...town,
        name: town.strings.town,
        nation: town.affiliation.nation,
        founder: town.strings.founder,
        created: town.timestamps?.registered,
        joinedNation: town.timestamps?.joinedNationAt,
        perms: {
            build: rnao.buildPerms,
            destroy: rnao.destroyPerms,
            switch: rnao.switchPerms,
            itemUse: rnao.itemUsePerms,
            flags
        }
    }

    delete obj.affiliation.nation
    delete obj.timestamps

    delete obj.strings.town
    delete obj.strings.founder

    delete obj.perms.rnaoPerms
    delete obj.perms.flagPerms

    return obj as OAPITown
}

class OfficialAPI {
    static serverInfo = async () => await townyData('', 'v2') as RawServerInfo

    static resident = async (name: string) => {
        // TODO: Properly handle this case and implement an error.
        if (!name) return

        const res = await townyData(`/residents/${name}`) as RawResident
        if (!res) throw new FetchError(`Could not fetch resident '${name}'. Received invalid response.`)

        return parseResident(res)
    }

    static town = async (name: string) => {
        if (!name) return

        const town = await townyData(`/towns/${name}`) as RawTown
        if (!town) return // TODO: Implement a proper error

        return parseTown(town)
    }

    static nation = async (name: string) => {
        if (!name) return

        const nation = await townyData(`/nations/${name}`) as RawNation
        if (!nation) return // TODO: Implement a proper error

        return {
            name: nation.strings.nation,
            created: nation.timestamps.registered,
            ...nation
        } as OAPINation
    }
}

export {
    OfficialAPI,
    OfficialAPI as default
}
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

class OfficialAPI {
    static serverInfo = async () => await townyData('', 'v2') as RawServerInfo

    static resident = async (name: string) => {
        // TODO: Properly handle this case and implement an error.
        if (!name) return

        const res = await townyData(`/residents/${name}`) as RawResident
        if (!res) throw new FetchError(`Could not fetch resident '${name}'. Received invalid response.`)

        const obj: any = {}
        if (res.status?.isOnline) 
            obj.online = res.status.isOnline

        if (res.stats?.balance) 
            obj.balance = res.stats.balance

        if (res.timestamps) obj.timestamps = res.timestamps
        if (res.strings?.username) obj.name = res.strings.username
        if (res.strings?.title) obj.title = res.strings.title
        if (res.strings?.surname) obj.surname = res.strings.surname

        const affiliation = res.affiliation
        if (affiliation?.town) obj.town = affiliation.town
        if (affiliation?.nation) obj.nation = affiliation.nation

        if (res.ranks?.townRanks) obj.townRanks = res.ranks.townRanks
        if (res.ranks?.nationRanks) obj.nationRanks = res.ranks.nationRanks

        const perms = res.perms
        if (perms) {
            const rnaoPerms = perms.rnaoPerms

            obj.perms = {
                build: rnaoPerms.buildPerms,
                destroy: rnaoPerms.destroyPerms,
                switch: rnaoPerms.switchPerms,
                itemUse: rnaoPerms.itemUsePerms,
                flags: perms.flagPerms
            }
        }

        return obj as OAPIResident
    }

    static town = async (name: string) => {
        if (!name) return

        const town = await townyData(`/towns/${name}`) as RawTown
        if (!town) return // TODO: Implement a proper error

        return {
            name: town.strings.town,
            founder: town.strings.founder,
            created: town.timestamps?.registered,
            joinedNation: town.timestamps?.joinedNationAt,
            ...town
        } as OAPITown
    }

    static nation = async (name: string) => {
        if (!name) return

        const nation = await townyData(`/nations/${name}`) as RawNation
        if (!nation) return // TODO: Implement a proper error

        return {
            name: nation.strings.nation,
            created: nation.timestamps.registered
        } as OAPINation
    }
}

export {
    OfficialAPI,
    OfficialAPI as default
}
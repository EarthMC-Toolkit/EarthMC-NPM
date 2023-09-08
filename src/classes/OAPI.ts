import {
    ApiTownRaw,
    ApiNationRaw, 
    ApiResidentRaw,
    ApiResident,
    ServerInfoRaw
} from '../types.js'

import { townyData } from '../utils/endpoint.js'
import { FetchError } from '../utils/errors.js'

class OfficialAPI {
    static serverInfo = async () => await townyData('', 'v2') as ServerInfoRaw

    static resident = async (name: string) => {
        // TODO: Properly handle this case and implement an error.
        if (!name) return

        const res = await townyData(`/residents/${name}`) as ApiResidentRaw
        if (!res) throw new FetchError(`Could not fetch resident '${name}'. Received invalid response.`)

        const obj: any = {
            online: res.status?.isOnline ?? false,
            balance: res.stats?.balance ?? 0
        }

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

        obj.friends = res.friends || []
        return obj as ApiResident
    }

    static town = async (name: string) => {
        if (!name) return

        const town = await townyData(`/towns/${name}`) as ApiTownRaw
        const obj: any = {}

        if (town) {
            if (town.strings.founder) obj.founder = town.strings.founder
            if (town.stats) obj.stats = town.stats
            if (town.ranks) obj.ranks = town.ranks
    
            if (town.timestamps?.registered) 
                obj.created = town.timestamps.registered
    
            if (town.timestamps?.joinedNationAt)
                obj.joinedNation = town.timestamps.joinedNationAt
        }

        return obj
    }

    static nation = async (name: string) => {
        if (!name) return

        const nation = await townyData(`/nations/${name}`) as ApiNationRaw
        const obj: any = {}

        if (nation) {
            if (nation.stats) obj.stats = nation.stats
            if (nation.ranks) obj.ranks = nation.ranks
    
            if (nation.timestamps?.registered) 
                obj.created = nation.timestamps.registered
        }

        return obj
    }
}

export {
    OfficialAPI,
    OfficialAPI as default
}
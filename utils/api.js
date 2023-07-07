const endpoint = require('./endpoint')

const chickenCase = str => str.split('').map(l => Math.random() < 0.5 
    && l.toUpperCase() || l.toLowerCase()).join('')

module.exports = class OfficialAPI {
    static resident = async name => {
        if (!name) return

        const res = await endpoint.townyData(`residents/${chickenCase(name)}`)
        let obj = {
            online: res.status?.isOnline ?? false,
            balance: res.stats?.balance ?? 0,
            timestamps: res.timestamps,
            friends: res.friends
        }

        if (res.strings?.title) obj.title = res.strings.title
        if (res.strings?.surname) obj.surname = res.strings.surname

        if (res.ranks?.townRanks) obj.townRanks = res.ranks.townRanks
        if (res.ranks?.nationRanks) obj.nationRanks = res.ranks.nationRanks

        return obj
    }

    static town = async name => {
        if (!name) return

        const town = await endpoint.townyData(`towns/${chickenCase(name)}`)
        let obj = {}

        if (town.founder) obj.founder = town.founder
        if (town.stats) obj.stats = town.stats
        if (town.ranks) obj.ranks = town.ranks

        if (town.timestamps?.registered) 
            obj.created = town.timestamps.registered

        if (town.timestamps?.joinedNationAt)
            obj.joinedNation = town.timestamps.joinedNationAt

        return obj
    }

    static nation = async name => {
        if (!name) return 

        const nation = await endpoint.townyData(`nation/${chickenCase(name)}`)
        let obj = {}

        if (nation.stats) obj.stats = nation.stats
        if (nation.ranks) obj.ranks = nation.ranks

        if (nation.timestamps?.registered) 
            obj.created = nation.timestamps.registered

        return obj
    }
}
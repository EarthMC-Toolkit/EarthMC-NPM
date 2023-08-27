const endpoint = require('./endpoint')

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function genRandomString(maxAmount = 20) {
    let token = ''
    let len = validChars.length

    for (let i = 0; i < maxAmount; i++) {
      const randomIndex = Math.floor(Math.random() * len)
      token += validChars.charAt(randomIndex)
    }
  
    return token
}

module.exports = class OfficialAPI {
    static resident = async name => {
        // TODO: Properly handle this case and implement an error.
        if (!name) return

        const res = await endpoint.townyData(`residents/${name}?${genRandomString()}`)
        let obj = {
            online: res.status?.isOnline ?? false,
            balance: res.stats?.balance ?? 0
        }

        if (res.timestamps) obj.timestamps = res.timestamps
        if (res.strings?.username) obj.name = res.strings.username
        if (res.strings?.title) obj.title = res.strings.title
        if (res.strings?.surname) obj.surname = res.strings.surname

        const affiliation = res.affiliation
        if (affiliation.town) obj.town = affiliation.town
        if (affiliation.nation) obj.nation = affiliation.nation

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
        return obj
    }

    static town = async name => {
        if (!name) return

        const town = await endpoint.townyData(`towns/${name}?${genRandomString()}`)
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

        const nation = await endpoint.townyData(`nation/${name}?${genRandomString()}`)
        let obj = {}

        if (nation.stats) obj.stats = nation.stats
        if (nation.ranks) obj.ranks = nation.ranks

        if (nation.timestamps?.registered) 
            obj.created = nation.timestamps.registered

        return obj
    }
}
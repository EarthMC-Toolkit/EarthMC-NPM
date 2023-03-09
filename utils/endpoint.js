const Undici = require("undici"),
      endpoints = require('../endpoints.json')

const agent = new Undici.Agent({ connect: { timeout: 60_000 } })
Undici.setGlobalDispatcher(agent)

const get = (dataType, map) => endpoints[dataType][map].toString()
const asJSON = async (url, n=5) => {
    let res = await Undici.request(url).then(res => res.body.json()).catch(async err => {
        return n == 1 ? err : await asJSON(url, n-1)
    })
    
    return res ?? (n == 1 ? null : await asJSON(url, n-1))
}

var archiveTs = false

module.exports = {
    get, asJSON, 
    useArchive: ts => archiveTs = ts,
    configData: async mapName => await asJSON(await get("config", mapName)),
    playerData: async mapName => await asJSON(await get("players", mapName)),
    mapData: async mapName => {
        let url = await get("map", mapName)
        return await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
    },
    getArchive: async (url, unixTs=Date.now()) => {
        let date = new Date(unixTs * 1000)
        const formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

        return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
    }
}
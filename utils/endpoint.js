const { request } = require("undici"),
      endpoints = require('../endpoints.json')

const get = (dataType, map) => endpoints[dataType][map].toString(),
      asJSON = url => request(url).then(res => res.body.json()).catch(e => console.log(e))

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
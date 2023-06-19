const { fetch, useDefaultAgent } = require("undici-shim"),
      endpoints = require('../endpoints.json')

if (useDefaultAgent) useDefaultAgent()

const get = (dataType, map) => endpoints[dataType][map].toString()
const asJSON = async (url, n = 5) => {
    const res = await fetch(url)
        .then(res => res.body.json())
        .catch(async err => n === 1 ? err : await asJSON(url, n-1))
    
    return res ?? (n === 1 ? null : await asJSON(url, n-1))
}

var archiveTs = false
const getArchive = async (url, unixTs = Date.now()) => {
    const date = new Date(unixTs * 1000),
          formattedTs = date.toISOString().replace(/\D/g, '').slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

module.exports = {
    get, asJSON, getArchive,
    useArchive: ts => archiveTs = ts,
    configData: async mapName => await asJSON(await get("config", mapName)),
    playerData: async mapName => await asJSON(await get("players", mapName)),
    mapData: async mapName => {
        let url = await get("map", mapName)
        return await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
    }
}
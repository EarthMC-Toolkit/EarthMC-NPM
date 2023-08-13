const { request, useDefaultAgent } = require("undici-shim"),
      endpoints = require('../endpoints.json')

if (useDefaultAgent) useDefaultAgent()

const get = (dataType, map) => endpoints[dataType][map].toString()
const asJSON = async (url, n = 3) => {
    const isBrowser = typeof window === "object"
    if (isBrowser) url = `https://corsproxy.io/?${encodeURIComponent(url)}`

    const retry = val => n === 1 ? val : asJSON(url, n - 1)
    const res = await request(url)
        .then(res => res.body?.json() || res.json())
        .catch(async err => await retry(err))
    
    return res ?? await retry(null)
}

let archiveTs = false
const getArchive = async (url, unixTs = Date.now()) => {
    const date = new Date(unixTs * 1000),
          formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

    return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
}

module.exports = {
    get, asJSON, getArchive,
    useArchive: ts => archiveTs = ts,
    configData: mapName => asJSON(get("config", mapName)),
    playerData: mapName => asJSON(get("players", mapName)),
    townyData: async endpoint => {
        if (endpoint.startsWith("/"))
            endpoint.replace("/", "")

        const url = get("towny", "aurora")
        return await asJSON(`${url}/${endpoint}`)
    },
    mapData: async mapName => {
        const url = await get("map", mapName)
        return await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
    }
}
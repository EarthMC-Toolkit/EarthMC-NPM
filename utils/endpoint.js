const { fetch } = require('undici'),
      refresh = () => asJSON(`https://raw.githubusercontent.com/EarthMC-Toolkit/Toolkit-Website/main/endpoints.json`),
      get = async (dataType, map) => refresh().then(obj => obj[dataType][map].toString()),
      asJSON = url => fetch(new URL(url)).then(res => res.json()).catch(e => console.log(e))

var archiveTs = false

module.exports = {
    refresh, get, asJSON,
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
    },
    useArchive: ts => archiveTs = ts
}
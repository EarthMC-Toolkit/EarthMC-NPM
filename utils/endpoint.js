const fetch = require('node-fetch'),
      endpoints = () => fetch(`https://raw.githubusercontent.com/EarthMC-Toolkit/Toolkit-Website/main/endpoints.json`).then(res => res.json()),
      get = (dataType, map) => endpoints().then(obj => obj[dataType][map].toString()),
      asJSON = url => fetch(new URL(url)).then(res => res.json()).catch(e => console.log(e)),
      getArchive = async (url, unixTs=Date.now()) => {
        let date = new Date(unixTs * 1000)
        const formattedTs = date.toISOString().replace(/[^0-9]/g, '').slice(0, -3)

        return await asJSON(`https://web.archive.org/web/${formattedTs}id_/${decodeURIComponent(url)}`)
      }

var archiveTs = false
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
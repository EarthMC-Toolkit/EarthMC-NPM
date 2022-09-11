const fetch = require('node-fetch'),
      endpoints = () => fetch(`https://raw.githubusercontent.com/EarthMC-Toolkit/Toolkit-Website/main/endpoints.json`).then(res => res.json()),
      get = (dataType, world) => endpoints().then(obj => obj[dataType][world].toString()),
      asJSON = url => fetch(new URL(url)).then(res => res.json()).catch(e => console.log(e)),
      getArchive = async (url, unixTs=Date.now()) => await asJSON(`https://web.archive.org/web/${unixTs.toString()}id_/${decodeURIComponent(url)}`)

var archiveTs = false
module.exports = {
    get, asJSON, getArchive,
    useArchive: ts => archiveTs = ts,
    playerData: async mapName => {
        let url = await get("players", mapName)
        return await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
    },
    mapData: async mapName => {
        let url = await get("map", mapName)
        return await !archiveTs ? asJSON(url) : getArchive(url, archiveTs)
    }
}
const fetch = require('node-fetch'),
      endpoints = () => fetch(`https://raw.githubusercontent.com/Owen3H/EarthMC-API/master/endpoints.json`).then(res => res.json()),
      get = (dataKey, worldKey) => endpoints().then(obj => obj[dataKey][worldKey].toString())

const playerData = async mapName => {
    let url = await get("players", mapName),
        route = new URL(url)

    return fetch(route).then(res => res.json()).catch(console.error)
}

const mapData = async mapName => {
    let url = await get("map", mapName),
        route = new URL(url)

    return fetch(route).then(res => res.json()).catch(console.error)
}

module.exports = {
    get,
    playerData,
    mapData
}
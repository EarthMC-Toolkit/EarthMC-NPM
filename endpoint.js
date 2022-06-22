const fn = require('./functions'),
      fetch = require('node-fetch'),
      endpoints = () => await fetch('https://raw.githubusercontent.com/Owen3H/EarthMC-API/master/endpoints.json').then(res => res.json()),
      get = (dataKey, worldKey) => await endpoints().then(obj => obj[dataKey][worldKey].toString())

async function playerData(map, modified = true) {
    var playerData = await fetch(get("players", map))
        .then(res => res.json()).catch(console.error)
        
    if (modified) playerData.players = fn.editPlayerProps(playerData.players)
    return playerData
}

async function mapData(map, modified = false) {
    let mapData = await fetch(get("map", map))
        .then(res => res.json()).catch(console.error)

    if (modified) {
        // Do modification
    }

    return mapData
}

module.exports = {
    get,
    playerData,
    mapData
}
var fetch = require('node-fetch')

var endpoints = async function() {
    var res = await fetch('https://raw.githubusercontent.com/Owen3H/EarthMC-API/master/endpoints.json')
    return await res.json()
}

async function get(dataKey, worldKey) {
    return await endpoints().then(obj => obj[dataKey][worldKey])
}

async function playerData(map) {
    let ep = await get("players", map),
        data = await fetch(ep.toString()).then(res => res.json()).catch(console.error)

    return data
}

async function mapData(map) {
    let ep = await get("map", map),
        mapData = await fetch(ep.toString()).then(res => res.json()).catch(console.error)

    return mapData
}

module.exports = {
    get,
    playerData,
    mapData
}
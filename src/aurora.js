var striptags = require("striptags"),
    endpoint = require("../utils/endpoint")

//#region Usable Functions
const error = (_name, _message) => ({ name: _name, message: _message })
async function getOnlinePlayer(playerNameInput) {
    if (!playerNameInput) return error("NO_PLAYER_INPUT", "No player was inputted!")
    else if (!isNaN(playerNameInput)) return error("INVALID_PLAYER_TYPE", "Player cannot be an integer.")

    var ops = await getOnlinePlayers(true)
    if (!ops) return error("FETCH_ERROR", "Error fetching data, please try again.")

    let foundPlayer = ops.find(op => op.name.toLowerCase() == playerNameInput.toLowerCase())
    if (!foundPlayer) return error("INVALID_PLAYER", "That player is offline or does not exist!")

    return foundPlayer
}

async function getOnlinePlayers(includeResidentInfo) {
    var onlinePlayers = await getOnlinePlayerData(),
        residents = await getResidents()

    if (!onlinePlayers || !residents) return null
    if (!includeResidentInfo) return onlinePlayers

    let merged = [],
        i = 0, len = onlinePlayers.length
    
    for (; i < len; i++) {
        merged.push({ 
            ...onlinePlayers[i], 
            ...(residents.find((itmInner) => itmInner.name === onlinePlayers[i].name)) 
        })
    }

    return merged
}

async function getResident(residentNameInput) {
    let residents = await getResidents(),
        foundResident = residents?.find(resident => resident.name.toLowerCase() == residentNameInput.toLowerCase())

    if (!foundResident) throw { name: "INVALID_RESIDENT", message: "That resident does not exist!" }
    return foundResident
}

async function getResidents() {
    let towns = await getTowns()
    if (!towns) return null

    let residentsArray = [],
        i = 0, len = towns.length

    for (; i < len; i++) {
        var currentTown = towns[i],
            j = 0, resLength = currentTown.residents.length

        for (; j < resLength; j++) {
            var currentResident = currentTown.residents[j],
                rank = "Resident"

            if (currentTown.capital && currentTown.mayor == currentResident) rank = "Nation Leader"
            else if (currentTown.mayor == currentResident) rank = "Mayor"

            let resident = {
                name: currentResident,
                town: currentTown.name,
                nation: currentTown.nation,
                rank: rank
            }

            residentsArray.push(resident)
        }
    }

    return residentsArray
}

async function getAllPlayers() {
    var onlinePlayers = await getOnlinePlayerData(),
        residents = await getResidents()

    if (!onlinePlayers || !residents) return null

    let i = 0, len = residents.length,
        ops = index => onlinePlayers.find(op => op.name === residents[index].name),
        merged = []
    
    for (; i < len; i++) merged.push({ ...residents[i], ...ops(i) })
    return merged
}

async function getPlayer(playerNameInput) {
    var allPlayers = await getAllPlayers()
    return allPlayers?.find(p => p.name.toLowerCase() == playerNameInput.toLowerCase()) ?? null
}

async function getTownless() {
    let mapData = await endpoint.mapData("aurora"),
        onlinePlayers = await getOnlinePlayerData()

    if (!onlinePlayers || !mapData) return

    var allTowns = [], allResidents = [],
        townData = mapData.sets["townyPlugin.markerset"].areas,
        townAreaNames = Object.keys(townData)
    
    let i = 0, len = townAreaNames.length

    for (; i < len; i++) {
        let town = townData[townAreaNames[i]],
            rawinfo = town.desc.split("<br />")

        var info = []

        rawinfo.forEach(x => { info.push(striptags(x)) })

        var name = info[0].split(" (")[0].replace(/_/gi, " ").trim()
        if (name.endsWith("(Shop)")) continue
                
        var mayor = info[1].slice(7)
        if (mayor == "") continue
        
        let residents = info[2].slice(9).split(", ")

        allTowns.push(residents)
    }

    // Push every resident in every town
    allTowns.forEach(town => { town.forEach(resident => allResidents.push(resident)) })

    var townlessPlayers = onlinePlayers.filter(op => !allResidents.find(resident => resident == op.name))
                                                
    townlessPlayers.sort((a, b) => {
        if (b.name.toLowerCase() < a.name.toLowerCase()) return 1
        if (b.name.toLowerCase() > a.name.toLowerCase()) return -1
    })

    return townlessPlayers
}

async function getInvitableTowns(nationName, includeBelonging) {
    let nation = await getNation(nationName)
    if (!nation || nation == "That nation does not exist!") return nation

    let towns = await getTowns()
    if (!towns) return null

    function invitable(town) {
        var sqr = Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ) <= 3500 && town.nation != nation.name
        return includeBelonging ? sqr : sqr && town.nation == "No Nation"
    }

    return towns.filter(town => invitable(town))
}

async function getJoinableNations(townName) {
    let town = await getTown(townName)
    if (!town || town == "That town does not exist!") return town
    
    let nations = await getNations()
    if (!nations) return null

    function joinable(n) { return Math.hypot(n.capitalX - town.x, n.capitalZ - town.z) <= 3500 && town.nation == "No Nation" }
    return nations.filter(nation => joinable(nation))
}

async function getNearbyPlayers(xInput, zInput, xRadius, zRadius) {
    let allPlayers = await getAllPlayers()
    if (!allPlayers) return null

    return allPlayers.filter(p => {            
        if (p.x == 0 && p.z == 0) return

        return (p.x <= (xInput + xRadius) && p.x >= (xInput - xRadius)) && 
               (p.z <= (zInput + zRadius) && p.z >= (zInput - zRadius))
    })
}

async function getNearbyTowns(xInput, zInput, xRadius, zRadius) {
    let towns = await getTowns()
    if (!towns) return null

    return towns.filter(t => {            
        return (t.x <= (xInput + xRadius) && t.x >= (xInput - xRadius)) &&
               (t.z <= (zInput + zRadius) && t.z >= (zInput - zRadius))
    })
}

async function getNearbyNations(xInput, zInput, xRadius, zRadius) {
    let nations = await getNations()
    if (!nations) return null

    return nations.filter(n => {            
        return (n.capitalX <= (xInput + xRadius) && n.capitalX >= (xInput - xRadius)) &&
               (n.capitalZ <= (zInput + zRadius) && n.capitalZ >= (zInput - zRadius))
    })
}
//#endregion

//#region Exports
module.exports = {
    getTown,
    getTowns,
    getNation,
    getNations,
    getResident,
    getResidents,
    getOnlinePlayer,
    getOnlinePlayers,
    getAllPlayers,
    getPlayer,
    getTownless,
    getInvitableTowns,
    getJoinableNations,
    getNearbyPlayers,
    getNearbyTowns,
    getNearbyNations
}
//#endregion
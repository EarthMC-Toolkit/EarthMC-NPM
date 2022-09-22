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

async function getResident(residentNameInput) {
    let residents = await getResidents(),
        foundResident = residents?.find(resident => resident.name.toLowerCase() == residentNameInput.toLowerCase())

    if (!foundResident) throw { name: "INVALID_RESIDENT", message: "That resident does not exist!" }
    return foundResident
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
        return fn.hypot(p.x, [xInput, xRadius]) && fn.hypot(p.z, [zInput, zRadius])
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
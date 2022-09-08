var striptags = require("striptags"),
    fn = require("./functions"),
    endpoint = require("./endpoint")

async function getOnlinePlayerData() {
    let playerData = await endpoint.playerData("aurora")
    return playerData?.players ? fn.editPlayerProps(playerData?.players) : null
}

//#region Usable Functions
async function getTown(townNameInput) {
    let towns = await getTowns(),
        foundTown = towns?.find(town => town.name.toLowerCase() == townNameInput.toLowerCase())

    return foundTown ?? "That town does not exist!"
}

async function getTowns(removeAccents = false) {
    let mapData = await endpoint.mapData("aurora")
    if (!mapData?.sets["townyPlugin.markerset"]) return null

    var townsArray = [], 
        townsArrayNoDuplicates = [],
        townData = mapData.sets["townyPlugin.markerset"].areas,
        townAreaNames = Object.keys(townData)

    let i = 0, len = townAreaNames.length
    const asBool = str => str == "true" ? true : false

    for (; i < len; i++) {      
        let town = townData[townAreaNames[i]],
            rawinfo = town.desc.split("<br />"),
            info = []

        // Strips html tags from town desc
        rawinfo.forEach(x => { info.push(striptags(x)) })

        var townName = info[0].split(" (")[0].trim()          
        if (townName.endsWith("(Shop)")) continue
      
        var mayor = info[1].slice(7)
        if (mayor == "") continue
        
        var nationName = (info[0].split(" (")[2] ?? info[0].split(" (")[1]).slice(0, -1),
            residents = info[2].slice(9).split(", ")

        let currentTown = {
            area: fn.calcArea(town.x, town.z, town.x.length),
            x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
            z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
            name: fn.formatString(townName, removeAccents),
            nation: nationName == "" ? "No Nation" : fn.formatString(nationName.trim(), removeAccents),
            mayor: info[1].slice(7),
            residents: residents,
            pvp: asBool(info[4]?.slice(5)),
            mobs: asBool(info[5]?.slice(6)),
            public: asBool(info[6]?.slice(8)),
            explosion: asBool(info[7]?.slice(11)),
            fire: asBool(info[8]?.slice(6)),
            capital: asBool(info[9]?.slice(9)),
            colourCodes: {
                fill: town.fillcolor,
                outline: town.color
            }
        }
        
        townsArray.push(currentTown)
    }
    
    // TOWN LOGIC \\  
    townsArray.forEach(function (a) {                   
        // If town doesnt exist, add it.
        if (!this[a.name]) {      
            this[a.name] = { ...a }
            townsArrayNoDuplicates.push(this[a.name])
        }
        else this[a.name].area += a.area
    }, Object.create(null))

    return townsArrayNoDuplicates
}

async function getNation(nationNameInput) {
    let nations = await getNations(),
        foundNation = nations?.find(nation => nation.name.toLowerCase() == nationNameInput.toLowerCase()) 

    return foundNation ?? "That nation does not exist!"
}

async function getNations() {
    let towns = await getTowns()
    if (!towns) return null

    let nations = [],
        i = 0, len = towns.length

    for (; i < len; i++) {
        let town = towns[i] 
        if (town.nation == "No Nation") continue

        if (!this[town.nation]) {          
            this[town.nation] = { 
                name: town.nation,
                residents: town.residents,
                towns: [],
                area: 0
            }

            nations.push(this[town.nation])
        }

        // If it already exists, add up stuff.
        this[town.nation].residents = fn.removeDuplicates(this[town.nation].residents.concat(town.residents))       
        this[town.nation].area += town.area // Add up the area

        // If the nation name is equal to the current towns nation
        if (this[town.nation].name == town.nation)
            this[town.nation].towns.push(town.name) // Push it to nation towns

        if (town.capital) {
            this[town.nation].capitalX = town.x
            this[town.nation].capitalZ = town.z
            this[town.nation].capitalName = town.name
            this[town.nation].king = town.mayor
        }   
    }

    return nations
}

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
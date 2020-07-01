var fetch = require("node-fetch"),
    striptags = require("striptags"),
    fn = require("./functions"),
    Minecraft = require("minecraft-lib")

async function getServerData()
{
    let serverData = await Minecraft.servers.get("play.earthmc.net").catch(err => { return err })

    let serverObj = {}

    if (!serverData)
    {
        serverObj["serverOnline"] = false
    }
    else
    {
        serverObj["serverOnline"] = true
        serverObj["online"] = serverData.players.online
        serverObj["max"] = serverData.players.max
    }

    return serverObj
}

async function getPlayerData()
{
    let playerData = await fetch("https://earthmc.net/map/up/world/earth/").then(response => response.json()).catch(err => { return err })    

    if (!playerData) return "Error fetching player data!"

    return playerData
}

async function getMapData()
{
    let mapData = await fetch("https://earthmc.net/map/tiles/_markers_/marker_earth.json").then(response => response.json()).catch(err => { return err })              

    if (!mapData) return "Error fetching map data!"

    return mapData
}

async function getOnlinePlayer (playerNameInput)
{
  if (!playerNameInput) throw { name: "NO_PLAYER_INPUT", message: "No player was inputted!" }
  else if (!isNaN(playerNameInput)) throw { name: "INVALID_PLAYER_TYPE", message: "Player cannot be an integer." }

  let playerData = await getPlayerData()

  let foundPlayer = playerData.players.find(player => player.account.toLowerCase() == playerNameInput.toLowerCase())

  if (foundPlayer)
  {
      fn.editPlayerProps(foundPlayer)

      return foundPlayer
  }
  else return "That player is offline or does not exist!"
}

async function getTowns()
{
    let mapData = await getMapData()
    let playerData = await getPlayerData()

    let townsArray = [], townsArrayNoDuplicates = []

    if (mapData.sets["townyPlugin.markerset"] != null || mapData.sets["townyPlugin.markerset"] != undefined)
    {
        var townData = mapData.sets["townyPlugin.markerset"].areas
    }
    else return

    let townAreaNames = Object.keys(townData)

    for (let i = 0; i < townAreaNames.length; i++)
    {      
        let town = townData[townAreaNames[i]]
        let rawinfo = town.desc.split("<br />")
        var info = []

        rawinfo.forEach(x => 
        {
             info.push(striptags(x)) // Strips html tags from town desc
        })

        var townName = info[0].split(" (")[0].trim()          
        if (townName.endsWith("(Shop)")) continue
      
        var mayor = info[1].slice(7)
        if (mayor == "") continue
        
        var nationName = info[0].split(" (")[1].slice(0, -1) == "" ? "No Nation" : info[0].split(" (")[1].slice(0, -1).trim()
        
        var residents = info[2].slice(9).split(", ")

        let currentTown = 
        {
            area: fn.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
            x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
            z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
            name: fn.removeStyleCharacters(townName),
            nation: fn.removeStyleCharacters(nationName),
            mayor: info[1].slice(7),
            residents: residents,
            onlineResidents: playerData.players.filter(op => residents.find(resident => resident == op.account)),
            pvp: info[5].slice(5) == "true" ? true : false,
            mobs:info[6].slice(6) == "true" ? true : false,
            public: info[7].slice(8) == "true" ? true : false,
            explosion: info[8].slice(11) == "true" ? true : false,
            fire: info[9].slice(6) == "true" ? true : false,
            capital: info[10].slice(9) == "true" ? true : false
        }
        
        townsArray.push(currentTown)
    }
    
    // TOWN LOGIC \\  
    townsArray.forEach(function (a) 
    {                   
          // If town doesnt exist, add it.
          if (!this[a.name]) 
          {      
              let nationResidents = []
            
              if (a.capital || a.nation != "No Nation")
              {
                  for (let i = 0; i < townsArray.length; i++)
                  {
                      var currentNation = townsArray[i].nation
                      let residents = townsArray[i].residents
                      
                      if (currentNation == a.nation)
                      {
                          for (let i = 0; i < residents.length; i++)
                          {
                              let currentResident = residents[i]
                              
                              nationResidents.push(currentResident)
                          }
                      }
                  }
              }
            
              this[a.name] = 
              { 
                  name: a.name, 
                  nation: a.nation,
                  residents: a.residents,
                  nationResidents: fn.removeDuplicates(nationResidents),
                  area: a.area,
                  mayor: a.mayor,
                  pvp: a.pvp,
                  mobs: a.mobs,
                  public: a.public,
                  explosion: a.explosion,
                  fire: a.fire,
                  capital: a.capital,
                  x: a.x,
                  z: a.z
              }    

              townsArrayNoDuplicates.push(this[a.name])
          }
          else
          {                         
              this[a.name].area += a.area
          }
    }, Object.create(null))

    return townsArrayNoDuplicates
}

async function getNations()
{
    let towns = await getTowns()

    let nationsArray = []

    towns.forEach(function (town) 
    {        
        if (town.nation != "No Nation")
        {
            // If nation doesn't exist
            if (!this[town.nation]) 
            {          
                this[town.nation] = 
                { 
                    name: town.nation,
                    residents: town.residents,
                    towns: [],
                    king: "Unavailable",
                    capitalName: "Unavailable",
                    capitalX: 0,
                    capitalZ: 0,
                    area: 0
                }

                nationsArray.push(this[town.nation])
            }

            // If it already exists, add up stuff.
            this[town.nation].residents = fn.removeDuplicates(this[town.nation].residents.concat(town.residents))       
            this[town.nation].area += town.area // Add up the area

            // If the nation name is equal to the current towns nation
            if (this[town.nation].name == town.nation)
            {
                this[town.nation].towns.push(town.name) // Push it to nation towns
            }

            if (town.capital) 
            {
                this[town.nation].capitalX = town.x
                this[town.nation].capitalZ = town.z
                this[town.nation].capitalName = town.name
                this[town.nation].king = town.mayor
            }   
        }
    }, Object.create(null))

    return nationsArray
}

async function getResidents()
{
    let towns = await getTowns()

    let residentsArray = []

    for (let i = 0; i < towns.length; i++)
    {
        var currentTown = towns[i]

        var rank

        for (let i = 0; i < currentTown.residents.length; i++)
        {
            var currentResident = currentTown.residents[i]

            if (currentTown.capital && currentTown.mayor == currentResident) rank = "Nation Leader"
            else if (currentTown.mayor == currentResident) rank = "Mayor"
            else rank = "Resident"

            let resident = 
            {
                name: currentResident,
                townName: currentTown.name,
                townNation: currentTown.nation,
                rank: rank
            }

            residentsArray.push(resident)
        }
    }

    return residentsArray
}

async function getTown(townNameInput)
{
    let towns = await getTowns()

    let foundTown = towns.find(town => town.name.toLowerCase() == townNameInput.toLowerCase())

    if (!foundTown) return "That town does not exist!"
    else return foundTown
}

async function getNation(nationNameInput)
{
    let nations = await getNations()

    let foundNation = nations.find(nation => nation.name.toLowerCase() == nationNameInput.toLowerCase())

    if (!foundNation) return "That nation does not exist!"
    else return foundNation
}

async function getResident(residentNameInput)
{
    let residents = await getResidents()

    let foundResident = residents.find(resident => resident.name.toLowerCase() == residentNameInput.toLowerCase())

    if (!foundResident) return "That resident does not exist!"
    else return foundResident
}

async function getTownless()
{
    let playerData = await getPlayerData()
    let mapData = await getMapData()

    var onlinePlayers = playerData.players

    var townData = mapData.sets["townyPlugin.markerset"].areas
    
    let townAreaNames = Object.keys(townData)

    var allTowns = [], allResidents = []
    
    for (let i = 0; i < townAreaNames.length; i++)
    {
        let town = townData[townAreaNames[i]]
        let rawinfo = town.desc.split("<br />")
        var info = []

        rawinfo.forEach(x => 
        {
            info.push(striptags(x)) // Strips html tags from town desc
        })

        var name = info[0].split(" (")[0].replace(/_/gi, " ").trim()
        if (name.endsWith("(Shop)")) continue
                
        var mayor = info[1].slice(7)
        if (mayor == "") continue
        
        let residents = info[2].slice(9).split(", ")

        allTowns.push(residents)
    }

    // Push every resident in every town
    allTowns.forEach(town => 
    {
        town.forEach(resident => allResidents.push(resident))
    })

    var townlessPlayers = onlinePlayers.filter(op => !allResidents.find(resident => resident == op.account))
                                                
    townlessPlayers.sort((a, b) => 
    {
        if (b.account.toLowerCase() < a.account.toLowerCase()) return 1
        if (b.account.toLowerCase() > a.account.toLowerCase()) return -1
    })

    fn.editPlayerPropsArray(townlessPlayers)

    return townlessPlayers
}

async function getServerInfo()
{
    let serverData = await getServerData()
    let playerData = await getPlayerData()

    // Makes server data be included in the queueObj
    this["info"] = serverData

    if (!playerData) 
    {
        this["info"]["townyOnline"] = false
    }
    else
    {           
        var towny = playerData.currentcount

        this["info"]["towny"] = towny
        this["info"]["townyOnline"] = true
        this["info"]["storming"] = playerData.hasStorm
        this["info"]["thundering"] = playerData.isThundering
    }

    let betaRes = await fetch("https://earthmc.net/map/beta/up/world/westeros/").catch(err => {})
    let betaData = await betaRes.json().catch(err => {})
    
    if (betaData)
    {
        var beta = betaData.currentcount

        this["info"]["beta"] = beta
        this["info"]["betaOnline"] = true
    }
    else 
    {
        this["info"]["beta"] = 0
        this["info"]["betaOnline"] = false
    }
        
    var queueCount = serverData.online - towny - beta

    this["info"]["queue"] = queueCount

    return this["info"]
}

module.exports =    
{
    getOnlinePlayer,
    getTowns,
    getNations,
    getResidents,
    getTown,
    getNation,
    getResident,
    getTownless,
    getServerInfo
}
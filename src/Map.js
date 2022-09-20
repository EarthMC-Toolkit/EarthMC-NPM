const fn = require('../utils/functions'),
      endpoint = require('../utils/endpoint'),
      { NotFound, FetchError } = require('../utils/Errors'),
      striptags = require("striptags")

class Map {
    name = ''

    constructor(map='aurora') {
        this.name = map
    }

    playerData = async () => await endpoint.playerData(this.name)
    mapData = async () => await endpoint.mapData(this.name)

    getOnlinePlayers = async () => {
        let pData = await this.playerData()
        return pData?.players ? fn.editPlayerProps(pData.players) : null
    }

    Towns = {
        get: async (...townList) => {
            let towns = await this.Towns.all()
            if (!towns) return new FetchError('Error fetching towns! Please try again.')
            
            let filter = t => towns.find(town => t.toLowerCase() == town.name.toLowerCase()) ?? NotFound(t)
            return townList.flat().map(t => filter(t))
        },
        all: async (removeAccents=false) => {
            let mapData = await this.mapData(),
                markerset = mapData?.sets["townyPlugin.markerset"]

            if (!markerset) return null
        
            let townsArray = [], 
                townsArrayNoDuplicates = [],
                townData = Object.keys(markerset.areas).map(key => markerset.areas[key]),
                i = 0, len = townData.length

            for (; i < len; i++) {      
                let town = townData[i],
                    rawinfo = town.desc.split("<br />"),
                    info = rawinfo.map(i => striptags(i))

                if (info[0].includes("(Shop)")) continue
              
                let mayor = info[1].slice(7)
                if (mayor == "") continue

                let split = info[0].split(" ("),
                    townName = split[0].trim(),
                    nationName = (split[2] ?? split[1]).slice(0, -1),
                    residents = info[2].slice(9).split(", ")
        
                let currentTown = {
                    name: fn.formatString(townName, removeAccents),
                    nation: nationName == "" ? "No Nation" : fn.formatString(nationName.trim(), removeAccents),
                    mayor: info[1].slice(7),
                    area: fn.calcArea(town.x, town.z, town.x.length),
                    x: fn.range(...town.x),
                    z: fn.range(...town.z),
                    residents: residents,
                    flags: {
                        pvp: fn.asBool(info[4]?.slice(5)),
                        mobs: fn.asBool(info[5]?.slice(6)),
                        public: fn.asBool(info[6]?.slice(8)),
                        explosion: fn.asBool(info[7]?.slice(11)),
                        fire: fn.asBool(info[8]?.slice(6)),
                        capital: fn.asBool(info[9]?.slice(9))
                    },
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
    }

    Nations = {
        get: async (...nationList) => {
            let nations = await this.Nations.all()
            if (!nations) return new FetchError('Error fetching nations! Please try again.')
        
            let filter = n => nations.find(nation => n.toLowerCase() == nation.name.toLowerCase()) ?? NotFound(n)
            return nationList.flat().map(n => filter(n))
        },
        all: async () => {
            let towns = await this.Towns.all(true)
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
    }
}

module.exports = Map
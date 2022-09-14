const fn = require('../utils/functions'),
      endpoint = require('../utils/endpoint'),
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
            if (!towns) return Error('Error fetching towns! Please try again.')
            
            return townList.flat().map(t => towns.find(town => t.toLowerCase() == town.name.toLowerCase()))
        },
        all: async (removeAccents=false) => {
            let mapData = await this.mapData()
            if (!mapData?.sets["townyPlugin.markerset"]) return null
        
            var townsArray = [], 
                townsArrayNoDuplicates = [],
                townData = mapData.sets["townyPlugin.markerset"].areas,
                townAreaNames = Object.keys(townData)
        
            let i = 0, len = townAreaNames.length
        
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
                    pvp: fn.asBool(info[4]?.slice(5)),
                    mobs: fn.asBool(info[5]?.slice(6)),
                    public: fn.asBool(info[6]?.slice(8)),
                    explosion: fn.asBool(info[7]?.slice(11)),
                    fire: fn.asBool(info[8]?.slice(6)),
                    capital: fn.asBool(info[9]?.slice(9)),
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
}

module.exports = Map
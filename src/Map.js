const fn = require('../utils/functions'),
      endpoint = require('../utils/endpoint'),
      { FetchError, NotFoundError, InvalidError } = require('../utils/Errors'),
      striptags = require("striptags"),
      { Mutex } = require('async-mutex'),
      OfficialAPI = require('../utils/api')

let cacheInstance = null
const cacheLock = new Mutex()

async function createCache(ttl = 120*1000) {
    const release = await cacheLock.acquire()

    if (!cacheInstance) {
        try {
            const tc = await import('timed-cache')
            cacheInstance = new tc.default({ defaultTtl: ttl })
        }
        catch (e) {
            cacheInstance = null
            console.error(e)
        } finally {
            release()
        }
    }

    return cacheInstance
}

class Map {
    name = ''
    #inviteRange = 0

    #isNode = true
    cache = null

    GPS = null

    constructor(map = 'aurora') {
        this.#isNode = globalThis.process?.release?.name == 'node'

        this.name = map
        this.#inviteRange = map == 'nova' ? 3000 : 3500
        this.GPS = new GPS(this)
    }

    handle = key => this.cache?.cache[`__cache__${key}`]?.handle
    mapData = async () => {
        if (!this.cache) 
            this.cache = await createCache()

        if (this.#isNode)
            this.handle('mapData')?.ref()

        let md = null
        if (!this.cache.get('mapData')) {
            md = await endpoint.mapData(this.name)

            this.cache.put('mapData', md)
            this.#unrefIfNode()
        }

        return md
    }

    #unrefIfNode = () => {
        if (this.#isNode)
            this.handle('mapData')?.unref()
    }

    playerData = () => endpoint.playerData(this.name)
    configData = () => endpoint.configData(this.name)

    #onlinePlayerData = async () => {
        const pData = await this.playerData()
        return pData?.players ? fn.editPlayerProps(pData.players) : null
    }

    markerset = async () => {
        const mapData = await this.mapData()
        return mapData?.sets["townyPlugin.markerset"]
    }

    Towns = {
        fromNation: async nation => {
            if (!nation) return new InvalidError(`Parameter 'nation' is ${nation}`)

            nation = await this.Nations.get(nation)
            if (nation instanceof NotFoundError) return nation

            return await this.Towns.get(nation.towns)
        },
        get: async (...townList) => {
            const towns = await this.Towns.all()
            if (!towns) return new FetchError('Error fetching towns! Please try again.')

            const existing = fn.getExisting(towns, townList, 'name')
            const isArr = existing instanceof Array

            const out = isArr ? existing.map(async town => ({ ...town, ...await OfficialAPI.town(town.name) }))
                : { ...existing, ...await OfficialAPI.town(existing.name) }

            return isArr ? Promise.all(out) : Promise.resolve(out)
        },
        all: async (removeAccents = false) => {
            let cachedTowns = this.cache?.get('towns')
            if (cachedTowns) return cachedTowns

            const markerset = await this.markerset()
            if (!markerset?.areas) return

            cachedTowns = []

            const townsArray = [], 
                townData = Object.keys(markerset.areas).map(key => markerset.areas[key]), 
                len = townData.length

            for (let i = 0; i < len; i++) {
                const town = townData[i], 
                      rawinfo = town.desc.split("<br />"), 
                      info = rawinfo.map(i => striptags(i, ['a']))

                if (info[0].includes("(Shop)")) continue

                const mayor = info[1].slice(7)
                if (mayor == "") continue

                let split = info[0].split(" (")
                split = (split[2] ?? split[1]).slice(0, -1)

                const residents = info[2].slice(9).split(", "), 
                      capital = fn.asBool(info[9]?.slice(9))

                let nationName = split, 
                    wikiPage = null

                // Check if we have a wiki
                if (split.includes('href')) {
                    nationName = split.slice(split.indexOf('>') + 1).replace('</a>', '')

                    split = split.replace('<a href="', '')
                    if (capital) wikiPage = split.substring(0, split.indexOf('"'))
                }

                const home = nationName != "" ? markerset.markers[`${town.label}__home`] : null
                let currentTown = {
                    name: fn.formatString(town.label, removeAccents),
                    nation: nationName == "" ? "No Nation" : fn.formatString(nationName.trim(), removeAccents),
                    mayor: mayor,
                    area: fn.calcArea(town.x, town.z, town.x.length),
                    x: home?.x ?? fn.range(town.x),
                    z: home?.z ?? fn.range(town.z),
                    residents: residents,
                    flags: {
                        pvp: fn.asBool(info[4]?.slice(5)),
                        mobs: fn.asBool(info[5]?.slice(6)),
                        public: fn.asBool(info[6]?.slice(8)),
                        explosion: fn.asBool(info[7]?.slice(11)),
                        fire: fn.asBool(info[8]?.slice(6)),
                        capital: capital
                    },
                    colourCodes: {
                        fill: town.fillcolor,
                        outline: town.color
                    }
                }

                if (wikiPage)
                    currentTown[ 'wiki' ] = wikiPage

                townsArray.push(currentTown)
            }

            const temp = {}

            //#region Remove duplicates & add to area
            townsArray.forEach(a => {
                const name = a.name
            
                if (temp[name]) temp[name].area += a.area
                else {    
                    temp[name] = a
                    cachedTowns.push(temp[name])
                }
            }, {})
            //#endregion

            if (cachedTowns.length > 0) {
                this.cache.put('towns', cachedTowns)
                this.#unrefIfNode()
            }

            return cachedTowns
        },
        nearby: async (xInput, zInput, xRadius, zRadius, towns = null) => {
            if (!towns) {
                towns = await this.Towns.all()
                if (!towns) return null
            }

            return towns.filter(t => 
                fn.hypot(t.x, [xInput, xRadius]) &&
                fn.hypot(t.z, [zInput, zRadius]))
        },
        invitable: async (nationName, includeBelonging = false) => {
            const nation = await this.Nations.get(nationName)
            if (!nation || nation instanceof Error) return nation

            const towns = this.cache.get('towns')
            if (!towns) return new FetchError('Error fetching towns! Please try again.')

            const invitable = town => {
                const sqr = fn.sqr(town, nation.capital, this.#inviteRange) && town.nation != nation.name
                return includeBelonging ? sqr : sqr && town.nation == "No Nation"
            }

            return towns.filter(t => invitable(t))
        }
    }

    Nations = {
        get: async (...nationList) => {
            const nations = await this.Nations.all()
            if (!nations) return new FetchError('Error fetching nations! Please try again.')
        
            return fn.getExisting(nations, nationList, 'name')
        },
        all: async towns => {
            if (!towns) {
                towns = await this.Towns.all()
                if (!towns) return null
            }

            let raw = {}, nations = [],
                i = 0, len = towns.length

            for (; i < len; i++) {
                let town = towns[i],
                    nationName = town.nation

                if (nationName == "No Nation") continue
        
                // Doesn't already exist, create new.
                if (!raw[nationName]) {          
                    raw[nationName] = { 
                        name: town.nation,
                        residents: town.residents,
                        towns: [],
                        area: 0
                    }
        
                    nations.push(raw[nationName])
                }
        
                //#region Add extra stuff
                raw[nationName].residents = fn.removeDuplicates(raw[nationName].residents.concat(town.residents))       
                raw[nationName].area += town.area
        
                // Current town is in existing nation
                if (raw[nationName].name == nationName) 
                    raw[nationName].towns?.push(town.name)
        
                if (town.flags.capital) {
                    if (town.wiki) raw[nationName].wiki = town.wiki

                    raw[nationName].king = town.mayor
                    raw[nationName].capital = {
                        name: town.name,
                        x: town.x,
                        z: town.z
                    }
                }
                //#endregion
            }

            return nations
        },
        nearby: async (xInput, zInput, xRadius, zRadius, nations=null) => {
            if (!nations) {
                nations = await this.Nations.all()
                if (!nations) return null
            }
        
            return nations.filter(n => 
                fn.hypot(n.capital.x, [xInput, xRadius]) && 
                fn.hypot(n.capital.z, [zInput, zRadius]))
        },
        joinable: async (townName, nationless=true) => {
            const town = await this.Towns.get(townName)
            if (!town || town == "That town does not exist!") return town

            const nations = await this.Nations.all(this.cache.get('towns'))
            if (!nations) return new FetchError('Error fetching nations! Please try again.')

            return nations.filter(n => {
                const joinable = fn.sqr(n.capital, town, this.#inviteRange)
                return nationless ? joinable && town.nation == "No Nation" : joinable
            })
        }
    }

    Residents = {
        fromTown: async town => {
            if (!town) return new InvalidError(`Parameter 'town' is ${town}`)

            town = await this.Towns.get(town)
            if (town instanceof NotFoundError) return town

            return await this.Residents.get(town.residents)
        },
        get: async (...residentList) => {
            const residents = await this.Residents.all()
            if (!residents) return new FetchError('Error fetching residents! Please try again.')

            const existing = fn.getExisting(residents, residentList, 'name')
            const isArr = existing instanceof Array

            const out = isArr ? existing.map(async res => ({ ...res, ...await OfficialAPI.resident(res.name) })) 
                : { ...existing, ...await OfficialAPI.resident(existing.name) }

            return isArr ? Promise.all(out) : Promise.resolve(out)
        },
        all: async towns => {
            if (!towns) {
                towns = await this.Towns.all()
                if (!towns) return null
            }
        
            const residentsArray = towns.reduce((acc, town) => {
                const townResidents = town.residents.map(res => {
                    return {
                        name: res,
                        town: town.name,
                        nation: town.nation,
                        rank: town.mayor ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
                    }
                })

                return [...acc, ...townResidents]
            }, [])
        
            return residentsArray
        }
    }

    Players = {
        get: async (...playerList) => {
            const players = await this.Players.all()
            if (!players) return new FetchError('Error fetching players! Please try again.')
            
            return fn.getExisting(players, playerList, 'name')
        },
        all: async () => {
            const onlinePlayers = await this.#onlinePlayerData()
            if (!onlinePlayers) return null

            let residents = await this.Residents.all()
            if (!residents) return null
        
            const len = residents.length,
                  ops = index => onlinePlayers.find(op => op.name === residents[index].name),
                  merged = []
            
            for (let i = 0; i < len; i++) 
                merged.push({ ...residents[i], ...ops(i) })

            return merged
        },
        townless: async () => {
            const mapData = await endpoint.mapData("aurora")
            if (!mapData) return new FetchError('Error fetching townless! Please try again.')
        
            const onlinePlayers = await this.Players.online()
            if (!onlinePlayers) return null

            const allResidents = [],
                  markerset = mapData.sets["townyPlugin.markerset"],
                  townData = Object.keys(markerset.areas).map(key => markerset.areas[key])
            
            const len = townData.length
            for (let i = 0; i < len; i++) {
                const town = townData[i],
                      rawinfo = town.desc.split("<br />"),
                      info = rawinfo.map(x => striptags(x))

                if (info[0].endsWith("(Shop)")) continue

                const mayor = info[1].slice(7)
                if (mayor == "") continue
                
                const residents = info[2].slice(9).split(", ")
                allResidents.push(...residents)
            }

            // Filter out residents & sort alphabetically
            return onlinePlayers.filter(op => !allResidents.find(resident => resident == op.name)).sort((a, b) => {
                if (b.name.toLowerCase() < a.name.toLowerCase()) return 1
                if (b.name.toLowerCase() > a.name.toLowerCase()) return -1
            })
        },
        online: async (includeResidentInfo=false) => {
            const onlinePlayers = await this.#onlinePlayerData()
            if (!onlinePlayers) return null
            if (!includeResidentInfo) return onlinePlayers

            const residents = await this.Residents.all()
            if (!residents) return null

            const merged = [], 
                  len = onlinePlayers.length

            for (let i = 0; i < len; i++) {
                let curOp = onlinePlayers[i],
                    foundRes = residents.find(res => res.name === curOp.name)

                merged.push({ ...curOp, ...foundRes })
            }
        
            return merged
        },
        nearby: async (xInput, zInput, xRadius, zRadius, players=null) => {
            if (!players) {
                players = await this.Players.all()
                if (!players) return null
            }

            return players.filter(p => {            
                if (p.x == 0 && p.z == 0) return
                return fn.hypot(p.x, [xInput, xRadius]) && fn.hypot(p.z, [zInput, zRadius])
            })
        }
    }
}

const mitt = require('mitt')

class GPS extends mitt {
    map = null

    static Route = {
        SAFEST: {
            avoidPvp: true,
            avoidPublic: true
        },
        FASTEST: {
            avoidPvp: false,
            avoidPublic: false
        },
        AVOID_PUBLIC: {
            avoidPvp: false,
            avoidPublic: true
        },
        AVOID_PVP: {
            avoidPvp: true,
            avoidPublic: false
        }
    }

    constructor(map = "aurora") {
        super()

        this.map = map
    }

    // routeToPlayer = async function(playerName, route = GPS.Route.FASTEST) {
    //     setInterval(async () => {
    //         const player = await this.map.Players.get(playerName) 
    //         const targetLoc = {
    //             x: player.x,
    //             z: player.z,
    //         }

    //         const routeInfo = await this.findRoute(targetLoc, route)
    //         const underground = 
    //             player.x == 0 && player.z == 0 && 
    //             player.world != "some-other-bogus-world"
            
    //         if (underground) this.emit('underground', routeInfo)
    //         else this.emit('update', routeInfo)
    //     }, 2000)

    //     return this
    // }

    safestRoute = async function(loc = { x, z }) {
        return await this.findRoute(loc, { 
            avoidPvp: true,
            avoidPublic: true
        })
    }

    fastestRoute = async function(loc = { x, z }) {
        return await this.findRoute(loc, { 
            avoidPvp: false, 
            avoidPublic: false 
        })
    }

    findRoute = async function(
        loc = { x, z }, 
        options = GPS.Route.FASTEST,
    ) {
        // Cannot use `!` as it considers 0 to be falsy.
        const xValid = loc.x === undefined || loc.z === null
        const zValid = loc.z === undefined || loc.z === null

        if (xValid || zValid) {
            const obj = JSON.stringify(loc)
            throw new Error(`Cannot calculate route! One or more inputs are invalid:\n${obj}`)
        }

        // Scan all nations for closest match.
        // Computationally more expensive to include PVP disabled nations.
        const [nations, towns] = await Promise.all([this.map.Nations.all(), this.map.Towns.all()])
        const filtered = []
        
        const len = nations.length
        for (let i = 0; i < len; i++) {
            const nation = nations[i]
            const capital = towns.find(t => t.name == nation.capital.name)
        
            // Filter out nations where either capital is not public 
            // or both avoidPvp and flags.pvp are true
            const flags = capital.flags

            const PVP = options.avoidPvp && flags.pvp
            const PUBLIC = options.avoidPublic && !flags.public

            if (PVP || PUBLIC) continue
            filtered.push(nation)
        }

        // Use reduce to find the minimum distance and corresponding nation
        const { distance, nation } = filtered.reduce((acc, nation) => {
            const dist = GPS.manhattan(nation.capital.x, nation.capital.z, loc.x, loc.z)

            // Update acc if this nation is closer
            const closer = !acc.distance || dist < acc.distance
            return !closer ? acc : { 
                distance: Math.round(dist), 
                nation: {
                    name: nation.name,
                    capital: nation.capital
                }
            }
        }, { distance: null, nation: null })

        const direction = GPS.cardinalDirection(nation.capital, loc)
        return { nation, distance, direction }
    }

    static cardinalDirection(loc1, loc2) {
        // Calculate the differences in x and z coordinates
        const deltaX = loc2.x - loc1.x
        const deltaZ = loc2.z - loc1.z

        const angleRad = Math.atan2(deltaZ, deltaX) // Calculate the angle in radians
        const angleDeg = (angleRad * 180) / Math.PI // Convert the angle from radians to degrees

        // Determine the cardinal direction
        if (angleDeg >= -45 && angleDeg < 45) 
            return "east"
        
        if (angleDeg >= 45 && angleDeg < 135) 
            return "north"
        
        if (angleDeg >= 135 || angleDeg < -135) 
            return "west"
        
        return "south"
    }
    
    static euclidean = (x1, z1, x2, z2) => 
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))

    static manhattan = (x1, z1, x2, z2) =>
        Math.abs(x2 - x1) + Math.abs(z2 - z1)
}

module.exports = Map
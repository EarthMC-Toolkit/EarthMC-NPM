/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import striptags from 'striptags'
import { asBool, calcAreaPoints, fastMergeUnique, formatString, range, roundToNearest16, safeParseInt } from '../../utils/functions.js'

import type {
    Resident,
    SquaremapMarkerset,
    SquaremapNation,
    SquaremapPlayer,
    SquaremapRawPlayer,
    SquaremapTown,
    StrictPoint2D
} from '../../types/index.js'

interface ParsedTooltip { 
    town: string
    nation?: string
    board?: string 
}

interface ParsedPopup {
    flags: {
        pvp: string
        public: string
    },
    wikis?: {
        town?: string
        nation?: string
    }
    mayor?: string
    founded: string
    councillors: string[]
    wealth: string
    residents: string[]
}

/**
 * Parses the tooltip on a marker - removing white space, new lines and HTML tags.
 * 
 * Returns an object with the following string elements: 
 * 
 * - town
 * 
 * - nation (May not exist) 
 * 
 * - board (May not exist)
 * @param tooltip The unparsed 'tooltip' value from a markerset.
 */
export const parseTooltip = (tooltip: string) => {
    const cleaned = striptags(tooltip.replaceAll('\n', '')).trim()

    const indexOpenBracket = cleaned.indexOf('(')
    const town = indexOpenBracket !== -1 ? cleaned.slice(0, indexOpenBracket).trim() : cleaned.trim()

    const out: ParsedTooltip = { town }

    const nationMatch = cleaned.match(/\((?:.* of )?([A-Za-z\u00C0-\u017F-_]+)\)/)
    const nation = nationMatch ? nationMatch[1] : null

    if (nation) out.nation = nation

    const indexClosingBracket = cleaned.indexOf(')')
    const board = indexClosingBracket !== -1 ? cleaned.slice(indexClosingBracket + 1).trim() : ''

    out.board = board

    return out
}

export const parsePopup = (popup: string): ParsedPopup => {
    const cleaned = striptags(popup.replaceAll('\n', ''), ['a']).trim()
    const info = cleaned.split(/\s{2,}/) // TODO: Future proof by regex matching instead of converting to array

    const title = info[0]

    const townWiki = title.match(/<a href="(.*)">(.*)<\/a> /)
    const nationWiki = title.match(/\(<a href="(.*)">(.*)<\/a>\)/)

    const sectioned = cleaned.replace(/\s{2,}/g, ' // ')
    const councillorsStr = extractSection(sectioned, 'Councillors')

    const residentsMatch = sectioned.match(/Residents: .*?\/\/(.*?)(?=\/\/|$)/)
    const residentsDetails = residentsMatch ? residentsMatch[1].trim() : null

    return {
        wikis: {
            town: townWiki ? townWiki[1] : null,
            nation: nationWiki ? nationWiki[1] : null
        },
        mayor: extractSection(sectioned, 'Mayor'),
        councillors: councillorsStr == "None" ? [] : councillorsStr.split(", "),
        founded: extractSection(sectioned, 'Founded'),
        wealth: extractSection(sectioned, 'Wealth'),
        residents: residentsDetails.split(", "),
        flags: {
            pvp: extractSection(sectioned, 'PVP'),
            public: extractSection(sectioned, 'Public')
        }
    }
}

const extractSection = (input: string, section: string) => {
    const match = input.match(new RegExp(`${section}:\\s*([^\\/]*)(?:\\s*\\/\\/)?`))
    return match ? match[1].trim() : null
}

export const parseInfoString = (str: string) => str.slice(str.indexOf(":") + 1).trim()

interface TownCoords {
    townX: number[]
    townZ: number[]
}

export const parseTowns = async(res: SquaremapMarkerset, removeAccents = false) => {
    if (res.id == "chunky") throw new Error("Error parsing towns: Chunky markerset detected, pass a towny markerset instead.")
    if (!res?.markers) throw new ReferenceError('Error parsing towns: Missing or invalid markers!')

    const len = res.markers.length
    const towns: SquaremapTown[] = []

    for (let i = 0; i < len; i++) {
        const curMarker = res.markers[i]
        if (curMarker.type == "icon") continue

        const points: StrictPoint2D[] = curMarker.points.flat(2)
        const { townX, townZ } = points.reduce((acc: TownCoords, p) => {
            acc.townX.push(roundToNearest16(p.x))
            acc.townZ.push(roundToNearest16(p.z))

            return acc
        }, { townX: [], townZ: [] })

        const parsedPopup = parsePopup(curMarker.popup)
        const parsedTooltip = parseTooltip(curMarker.tooltip)

        const townName = parsedTooltip.town || ''
        const nationName = parsedTooltip.nation ? formatString(parsedTooltip.nation, removeAccents) : "No Nation"

        const town: SquaremapTown = {
            name: formatString(townName, removeAccents),
            nation: nationName,
            foundedTimestamp: Math.floor(new Date(parsedPopup.founded).getTime() / 1000),
            mayor: parsedPopup.mayor,
            councillors: parsedPopup.councillors,
            residents: parsedPopup.residents,
            x: range(townX),
            z: range(townZ),
            area: calcAreaPoints(points),
            points,
            bounds: {
                x: townX,
                z: townZ
            },
            flags: {
                // Flags no longer shown
                pvp: asBool(parsedPopup.flags.pvp),
                public: asBool(parsedPopup.flags.public),
                capital: curMarker.tooltip.includes('Capital of')
            },
            colours: {
                fill: curMarker.fillColor || curMarker.color,
                outline: curMarker.color
            },
            opacities: {
                fill: curMarker.fillOpacity || curMarker.opacity,
                outline: curMarker.opacity
            }
        }

        // Dont include board if it's default or empty.
        if (parsedTooltip.board != "/town set board [msg]" && parsedTooltip.board != "") {
            town.board = parsedTooltip.board
        }

        //#region Add wikis if they exist
        if (parsedPopup.wikis.town || parsedPopup.wikis.nation) {
            town.wikis = {}
        }

        if (parsedPopup.wikis.town) {
            town.wikis.town = parsedPopup.wikis.town
        }

        if (parsedPopup.wikis.nation) {
            town.wikis.nation = parsedPopup.wikis.nation
        }
        //#endregion

        if (parsedPopup.wealth) {
            town.wealth = safeParseInt(parsedPopup.wealth.slice(0, -1))
        }

        towns.push(town)
    }

    return towns
}

export const parseNations = async(towns: SquaremapTown[]) => {
    const raw: Record<string, SquaremapNation> = {}
    const nations: SquaremapNation[] = []
    const len = towns.length

    for (let i = 0; i < len; i++) {
        const town = towns[i]
        
        const nationName = town.nation
        if (nationName == "No Nation") continue

        // Doesn't already exist, create new.
        if (!raw[nationName]) {          
            raw[nationName] = { 
                name: nationName,
                residents: [],
                councillors: [],
                towns: [],
                area: 0,
                wealth: 0,
                king: undefined,
                capital: undefined
            }

            nations.push(raw[nationName])
        }

        //#region Add extra stuff
        const resNames = raw[nationName].residents

        raw[nationName].residents = fastMergeUnique(resNames, town.residents)
        raw[nationName].councillors = fastMergeUnique(raw[nationName].councillors, town.councillors)

        raw[nationName].area += town.area
        raw[nationName].wealth += town.wealth

        // Current town is in existing nation
        if (raw[nationName].name == nationName) 
            raw[nationName].towns?.push(town.name)

        if (town.flags.capital) {
            if (town.wikis?.nation) raw[nationName].wiki = town.wikis.nation

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
}

// ~ 1-2ms
export const parseResidents = (towns: SquaremapTown[]) => towns.reduce((acc: Resident[], town: SquaremapTown) => {
    acc.push.apply(acc, town.residents.map(res => ({
        name: res,
        town: town.name,
        nation: town.nation,
        rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
    })))

    return acc
}, [])

const editPlayerProps = (player: SquaremapRawPlayer): SquaremapPlayer => ({
    name: player.name,
    nickname: striptags(formatString(player.display_name)),
    x: player.x,
    z: player.z,
    yaw: player.yaw,
    underground: player.world != 'earth',
    world: player.world,
    online: true
})

export const parsePlayers = (players: SquaremapRawPlayer[]) => {
    if (!players) throw new Error("Error parsing players: Input was null or undefined!")
    if (!(players instanceof Array)) throw new TypeError("Error parsing players: Input type must be `Object` or `Array`.")

    return players.length > 0 ? players.map(p => editPlayerProps(p)) : []
}

//#region TESTING
import { endpoint, type SquaremapMapResponse } from 'src/main.js'

async function test() {
    const res = await endpoint.mapData<SquaremapMapResponse>('aurora')
    const markerset = res.find(x => x.id == "towny")

    await parseTowns(markerset)
}

test()
//#endregion

//#region OLD STUFF
// export const parsePopup = (popup: string): ParsedPopup => {
//     const cleaned = striptags(popup.replaceAll('\n', ''), ['a']).trim()
//     const info = cleaned.split(/\s{2,}/) // TODO: Future proof by regex matching instead of converting to array

//     // Remove board since we get that from the tooltip
//     if (info.length >= 9)
//         info.splice(1, 1)

//     const title = info[0]

//     const townWiki = title.match(/<a href="(.*)">(.*)<\/a> /)
//     const nationWiki = title.match(/\(<a href="(.*)">(.*)<\/a>\)/)

//     const councillorsStr = parseInfoString(info[2])

//     return {
//         flags: {
//             pvp: parseInfoString(info[5]),
//             public: parseInfoString(info[6])
//         },
//         wikis: {
//             town: townWiki ? townWiki[1] : null,
//             nation: nationWiki ? nationWiki[1] : null
//         },
//         mayor: parseInfoString(info[1]),
//         councillors: councillorsStr == "None" ? [] : councillorsStr.split(", "),
//         founded: parseInfoString(info[3]),
//         wealth: parseInfoString(info[4]),
//         residents: info[7]?.split(", ")
//     }
// }

// ~ 70-80ms
// export const parseResidents = (towns: SquaremapTown[]) => towns.reduce((acc: Resident[], town: SquaremapTown) => [
//     ...acc,
//     ...town.residents.map(res => {
//         const r: Resident = {
//             name: res,
//             town: town.name,
//             nation: town.nation,
//             rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
//         }

//         return r
//     })
// ], [])
//#endregion
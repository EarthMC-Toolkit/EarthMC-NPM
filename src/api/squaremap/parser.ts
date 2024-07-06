/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import striptags from 'striptags'
import { calcArea, fastMergeUnique, formatString, range, roundToNearest16, safeParseInt } from '../../utils/functions.js'

import type {
    Nation,
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
    wiki?: string
    mayor?: string
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

    if (nation) out['nation'] = nation

    const indexClosingBracket = cleaned.indexOf(')')
    const board = indexClosingBracket !== -1 ? cleaned.slice(indexClosingBracket + 1).trim() : ''

    if (board) out['board'] = board

    return out
}

export const parsePopup = (popup: string): ParsedPopup => {
    const cleaned = striptags(popup.replaceAll('\n', ''), ['a']).trim()
    const info = cleaned.split(/\s{2,}/)

    const wikiMatch = info[0].match(/href="([^"]*)"/)
    const wiki = wikiMatch ? wikiMatch[1] : null

    // Town includes a board.
    if (info.length == 7) {
        const councillorsStr = parseInfoString(info[3])

        return {
            wiki,
            mayor: parseInfoString(info[2]),
            councillors: councillorsStr == "None" ? [] : councillorsStr.split(", "),
            wealth: parseInfoString(info[4]),
            residents: info[6].split(", ")
        }
    }

    const councillorsStr = parseInfoString(info[2])

    return {
        wiki,
        mayor: parseInfoString(info[1]),
        councillors: councillorsStr == "None" ? [] : councillorsStr.split(", "),
        wealth: parseInfoString(info[3]),
        residents: info[5].split(", ")
    }
}

export const parseInfoString = (str: string) => str.slice(str.indexOf(":") + 1).trim()

interface TownCoords {
    townX: number[]
    townZ: number[]
}

export const parseTowns = async(res: SquaremapMarkerset, removeAccents = false) => {
    if (res.id == "chunky") throw new Error("Error parsing towns: Chunky markerset detected, pass a towny markerset instead.")
    if (!res?.markers) throw new ReferenceError('Error parsing towns: Missing or invalid markers!')

    // Using a set is faster and does not allow duplicate keys.
    const capitals = res.markers.reduce((acc, x) => {
        if (x.type == "icon" && x.icon.includes("capital")) {
            acc.add(parseTooltip(x.tooltip).town)
        }

        return acc
    }, new Set<string>())

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
            board: parsedTooltip.board,
            wealth: safeParseInt(parsedPopup.wealth.slice(0, -1)),
            mayor: parsedPopup.mayor,
            councillors: parsedPopup.councillors,
            residents: parsedPopup.residents,
            area: calcArea(townX, townZ, townX.length),
            bounds: {
                x: townX,
                z: townZ
            },
            points,
            x: range(townX),
            z: range(townZ),
            flags: {
                // Flags no longer shown
                //pvp: asBool(parseInfoString(info[3])),
                capital: capitals.has(townName) || curMarker.tooltip.includes('Capital of')
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

        if (parsedPopup.wiki) {
            town.wiki = parsedPopup.wiki
        }

        towns.push(town)
    }

    return towns
}

export const parseNations = async(towns: SquaremapTown[]) => {
    const raw: Record<string, SquaremapNation> = {}
    const nations: Nation[] = []
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
}

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

// async function test() {
//     const res = await endpoint.mapData<SquaremapMapResponse>('aurora')
//     const markerset = res.find(x => x.id == "towny")

//     await parseTowns(markerset)
// }

// test()